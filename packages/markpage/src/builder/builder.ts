import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { marked } from 'marked';
import { buildNavigationTree, validateContentStructure } from './parser.js';
import { BuildOptions, BuildResult, NavigationItem, ContentProcessor } from '../types.js';
import { checkMarkdownLinksForNavigation } from './link-check.js';

export class BuilderError extends Error {
  constructor(message: string, public filePath?: string) {
    super(message);
    this.name = 'BuilderError';
  }
}

export interface ContentBundle {
  [path: string]: string;
}

export async function buildPages(
  contentPath: string,
  options: BuildOptions = {}
): Promise<BuildResult> {
  try {
    // Validate content structure
    validateContentStructure(contentPath, { autoDiscover: options.autoDiscover });
    
    // Build navigation tree
    const navigation = buildNavigationTree(contentPath, { autoDiscover: options.autoDiscover });
    
    // Bundle markdown content if requested
    let content: ContentBundle | undefined;
    if (options.includeContent !== false) {
      content = bundleMarkdownContent(navigation, contentPath, options);
    }

    // Optional link checking (warnings-only unless failOnBroken is set)
    let linkCheck: BuildResult['linkCheck'] | undefined;
    const linkCheckOptRaw = options.linkCheck;
    const linkCheckEnabled = !!linkCheckOptRaw;
    const linkCheckOpt = typeof linkCheckOptRaw === 'object' && linkCheckOptRaw ? linkCheckOptRaw : {};

    if (linkCheckEnabled) {
      linkCheck = checkMarkdownLinksForNavigation(contentPath, navigation, {
        warnOnUnindexed: linkCheckOpt.warnOnUnindexed,
      });
      if (linkCheckOpt.failOnBroken && linkCheck.issues.length > 0) {
        throw new BuilderError(
          `Link check failed: ${linkCheck.issues.length} issue(s) found`,
          contentPath
        );
      }
    }
    
    // Write outputs
    if (options.appOutput) {
      await writeAppOutput(navigation, content, options.appOutput);
    }
    
    if (options.websiteOutput) {
      await writeWebsiteOutput(navigation, options.websiteOutput);
    }
    
    return {
      navigation,
      content: content || undefined,
      linkCheck
    };
  } catch (error) {
    if (error instanceof BuilderError) {
      throw error;
    }
    
    throw new BuilderError(
      `Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      contentPath
    );
  }
}

function bundleMarkdownContent(
  navigation: NavigationItem[],
  basePath: string,
  options: BuildOptions
): ContentBundle {
  const mode = options.contentMode || 'all';
  return mode === 'index-only'
    ? bundleNavigationContent(navigation, basePath)
    : bundleAllMarkdownContent(basePath);
}

function bundleNavigationContent(
  navigation: NavigationItem[],
  basePath: string
): ContentBundle {
  const content: ContentBundle = {};

  function processItems(items: NavigationItem[]): void {
    for (const item of items) {
      if (item.type === 'page' && item.path) {
        const filePath = join(basePath, item.path);
        try {
          const markdownContent = readFileSync(filePath, 'utf-8');
          content[item.path] = markdownContent;
        } catch (error) {
          throw new BuilderError(
            `Failed to read markdown file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath
          );
        }
      } else if (item.type === 'section' && item.path) {
        // Bundle content for sections that have a path (README/index.md files)
        const filePath = join(basePath, item.path);
        try {
          const markdownContent = readFileSync(filePath, 'utf-8');
          content[item.path] = markdownContent;
        } catch (error) {
          throw new BuilderError(
            `Failed to read section markdown file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath
          );
        }
      }

      if (item.items) {
        processItems(item.items);
      }
    }
  }

  processItems(navigation);
  return content;
}

function bundleAllMarkdownContent(basePath: string): ContentBundle {
  const content: ContentBundle = {};

  function walk(directory: string): void {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      throw new BuilderError(
        `Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        directory
      );
    }

    for (const entry of entries) {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        if (entry.name.startsWith('.')) {
          continue;
        }
        walk(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.md')) {
        const relativePath = relative(basePath, entryPath);
        try {
          const markdownContent = readFileSync(entryPath, 'utf-8');
          content[relativePath] = markdownContent;
        } catch (error) {
          throw new BuilderError(
            `Failed to read markdown file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            entryPath
          );
        }
      }
    }
  }

  walk(basePath);
  return content;
}

async function writeAppOutput(
  navigation: NavigationItem[],
  content: ContentBundle | undefined,
  outputPath: string
): Promise<void> {
  try {
    mkdirSync(dirname(outputPath), { recursive: true });
    
    // Write navigation
    const navigationPath = join(outputPath, 'navigation.json');
    writeFileSync(navigationPath, JSON.stringify(navigation, null, 2));
    
    // Write content if available
    if (content) {
      const contentPath = join(outputPath, 'content.json');
      writeFileSync(contentPath, JSON.stringify(content, null, 2));
    }
  } catch (error) {
    throw new BuilderError(
      `Failed to write app output: ${error instanceof Error ? error.message : 'Unknown error'}`,
      outputPath
    );
  }
}

async function writeWebsiteOutput(
  navigation: NavigationItem[],
  outputPath: string
): Promise<void> {
  try {
    mkdirSync(dirname(outputPath), { recursive: true });
    
    const navigationPath = join(outputPath, 'navigation.json');
    writeFileSync(navigationPath, JSON.stringify(navigation, null, 2));
  } catch (error) {
    throw new BuilderError(
      `Failed to write website output: ${error instanceof Error ? error.message : 'Unknown error'}`,
      outputPath
    );
  }
}

// Deprecated: markdown rendering is handled at runtime by renderer packages
export function processMarkdown(content: string, processor?: ContentProcessor): string {
  return processor ? processor.process(content) : content;
}

export function generateStaticPages(
  navigation: NavigationItem[],
  basePath: string,
  options: {
    processor?: ContentProcessor;
    pageOptions?: {
      title?: string;
      baseUrl?: string;
      css?: string;
      js?: string;
    };
  } = {}
): Array<{
  path: string;
  content: string;
  html: string;
}> {
  const pages: Array<{
    path: string;
    content: string;
    html: string;
  }> = [];
  
  function processItems(items: NavigationItem[]): void {
    for (const item of items) {
      if (item.type === 'page' && item.path) {
        const filePath = join(basePath, item.path);
        try {
          const markdownContent = readFileSync(filePath, 'utf-8');
          const processedMd = processMarkdown(markdownContent, options.processor);
          const fullHtml = generateHTMLPage(processedMd, item.label, options.pageOptions);
          
          pages.push({
            path: item.path.replace(/\.md$/, '.html'),
            content: markdownContent,
            html: fullHtml
          });
        } catch (error) {
          throw new BuilderError(
            `Failed to process page ${item.path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath
          );
        }
      } else if (item.items) {
        processItems(item.items);
      }
    }
  }
  
  processItems(navigation);
  return pages;
}

function generateHTMLPage(
  content: string,
  title: string,
  options: {
    title?: string;
    baseUrl?: string;
    css?: string;
    js?: string;
  } = {}
): string {
  const pageTitle = options.title || title;
  const baseUrl = options.baseUrl || '';
  const css = options.css || '';
  const js = options.js || '';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <base href="${baseUrl}">
    ${css ? `<style>${css}</style>` : ''}
</head>
<body>
    <div class="content">
        ${content}
    </div>
    ${js ? `<script>${js}</script>` : ''}
</body>
</html>`;
}
