import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { marked } from 'marked';
import { buildNavigationTree, validateContentStructure } from './parser.js';
import { BuildOptions, BuildResult, NavigationTree, ContentProcessor } from '../types.js';

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
      content = bundleMarkdownContent(navigation, contentPath);
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
      content: content || undefined
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
  navigation: NavigationTree,
  basePath: string
): ContentBundle {
  const content: ContentBundle = {};
  
  function processItems(items: NavigationTree['items']): void {
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
      } else if (item.items) {
        processItems(item.items);
      }
    }
  }
  
  processItems(navigation.items);
  return content;
}

async function writeAppOutput(
  navigation: NavigationTree,
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
  navigation: NavigationTree,
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

export function processMarkdown(
  content: string,
  processor?: ContentProcessor
): string {
  if (processor) {
    content = processor.process(content);
  }
  
  return marked(content);
}

export function generateStaticPages(
  navigation: NavigationTree,
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
  
  function processItems(items: NavigationTree['items']): void {
    for (const item of items) {
      if (item.type === 'page' && item.path) {
        const filePath = join(basePath, item.path);
        try {
          const markdownContent = readFileSync(filePath, 'utf-8');
          const htmlContent = processMarkdown(markdownContent, options.processor);
          const fullHtml = generateHTMLPage(htmlContent, item.label, options.pageOptions);
          
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
  
  processItems(navigation.items);
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