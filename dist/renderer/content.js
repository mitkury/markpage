import { marked } from 'marked';
export class ContentLoader {
    constructor(content, processor) {
        this.content = content;
        this.processor = processor;
    }
    loadContent(path) {
        return this.content[path];
    }
    loadAndProcess(path) {
        const content = this.loadContent(path);
        if (!content) {
            return undefined;
        }
        return this.processContent(content);
    }
    processContent(content) {
        if (this.processor) {
            content = this.processor.process(content);
        }
        return marked(content);
    }
    hasContent(path) {
        return path in this.content;
    }
    getAvailablePaths() {
        return Object.keys(this.content);
    }
    getContentSize(path) {
        const content = this.loadContent(path);
        return content ? content.length : 0;
    }
    getTotalContentSize() {
        return Object.values(this.content).reduce((total, content) => total + content.length, 0);
    }
}
export async function loadContent(path, contentBundle, processor) {
    const loader = new ContentLoader(contentBundle, processor);
    return loader.loadAndProcess(path);
}
export function createContentLoader(contentBundle, processor) {
    return new ContentLoader(contentBundle, processor);
}
// Utility functions for content processing
export function extractHeadings(content) {
    const headings = [];
    const lines = content.split('\n');
    for (const line of lines) {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match && match[1] && match[2]) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            headings.push({ level, text, id });
        }
    }
    return headings;
}
export function extractTableOfContents(content) {
    const headings = extractHeadings(content);
    if (headings.length === 0) {
        return '';
    }
    const toc = ['## Table of Contents', ''];
    for (const heading of headings) {
        const indent = '  '.repeat(heading.level - 1);
        toc.push(`${indent}- [${heading.text}](#${heading.id})`);
    }
    return toc.join('\n');
}
export function addTableOfContents(content) {
    const toc = extractTableOfContents(content);
    if (!toc) {
        return content;
    }
    const lines = content.split('\n');
    const firstHeadingIndex = lines.findIndex(line => line.match(/^#{1,6}\s+/));
    if (firstHeadingIndex === -1) {
        return content;
    }
    lines.splice(firstHeadingIndex, 0, toc, '');
    return lines.join('\n');
}
//# sourceMappingURL=content.js.map