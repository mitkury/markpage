import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { marked } from 'marked';
import { buildNavigationTree, validateContentStructure } from './parser.js';
export class BuilderError extends Error {
    constructor(message, filePath) {
        super(message);
        this.filePath = filePath;
        this.name = 'BuilderError';
    }
}
export async function buildDocs(contentPath, options = {}) {
    try {
        // Validate content structure
        validateContentStructure(contentPath);
        // Build navigation tree
        const navigation = buildNavigationTree(contentPath);
        // Bundle markdown content if requested
        let content;
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
    }
    catch (error) {
        if (error instanceof BuilderError) {
            throw error;
        }
        throw new BuilderError(`Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`, contentPath);
    }
}
function bundleMarkdownContent(navigation, basePath) {
    const content = {};
    function processItems(items) {
        for (const item of items) {
            if (item.type === 'page' && item.path) {
                const filePath = join(basePath, item.path);
                try {
                    const markdownContent = readFileSync(filePath, 'utf-8');
                    content[item.path] = markdownContent;
                }
                catch (error) {
                    throw new BuilderError(`Failed to read markdown file: ${error instanceof Error ? error.message : 'Unknown error'}`, filePath);
                }
            }
            else if (item.items) {
                processItems(item.items);
            }
        }
    }
    processItems(navigation.items);
    return content;
}
async function writeAppOutput(navigation, content, outputPath) {
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
    }
    catch (error) {
        throw new BuilderError(`Failed to write app output: ${error instanceof Error ? error.message : 'Unknown error'}`, outputPath);
    }
}
async function writeWebsiteOutput(navigation, outputPath) {
    try {
        mkdirSync(dirname(outputPath), { recursive: true });
        const navigationPath = join(outputPath, 'navigation.json');
        writeFileSync(navigationPath, JSON.stringify(navigation, null, 2));
    }
    catch (error) {
        throw new BuilderError(`Failed to write website output: ${error instanceof Error ? error.message : 'Unknown error'}`, outputPath);
    }
}
export function processMarkdown(content, processor) {
    if (processor) {
        content = processor.process(content);
    }
    return marked(content);
}
export function generateStaticPages(navigation, basePath, options = {}) {
    const pages = [];
    function processItems(items) {
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
                }
                catch (error) {
                    throw new BuilderError(`Failed to process page ${item.path}: ${error instanceof Error ? error.message : 'Unknown error'}`, filePath);
                }
            }
            else if (item.items) {
                processItems(item.items);
            }
        }
    }
    processItems(navigation.items);
    return pages;
}
function generateHTMLPage(content, title, options = {}) {
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
//# sourceMappingURL=builder.js.map