import { marked } from 'marked';
import { ContentProcessor, ContentProcessorOptional } from '../types.js';

export class ContentLoader {
  private content: Record<string, string>;
  private processor?: ContentProcessorOptional | undefined;

  constructor(content: Record<string, string>, processor?: ContentProcessorOptional) {
    this.content = content;
    this.processor = processor;
  }

  loadContent(path: string): string | undefined {
    return this.content[path];
  }

  loadAndProcess(path: string): string | undefined {
    const content = this.loadContent(path);
    if (!content) {
      return undefined;
    }

    return this.processContent(content);
  }

  processContent(content: string): string {
    if (this.processor) {
      content = this.processor.process(content);
    }

    return marked(content);
  }

  hasContent(path: string): boolean {
    return path in this.content;
  }

  getAvailablePaths(): string[] {
    return Object.keys(this.content);
  }

  getContentSize(path: string): number {
    const content = this.loadContent(path);
    return content ? content.length : 0;
  }

  getTotalContentSize(): number {
    return Object.values(this.content).reduce((total, content) => total + content.length, 0);
  }
}

export async function loadContent(
  path: string,
  contentBundle: Record<string, string>,
  processor?: ContentProcessorOptional
): Promise<string | undefined> {
  const loader = new ContentLoader(contentBundle, processor);
  return loader.loadAndProcess(path);
}

export function createContentLoader(
  contentBundle: Record<string, string>,
  processor?: ContentProcessorOptional
): ContentLoader {
  return new ContentLoader(contentBundle, processor);
}

// Utility functions for content processing
export function extractHeadings(content: string): Array<{
  level: number;
  text: string;
  id: string;
}> {
  const headings: Array<{
    level: number;
    text: string;
    id: string;
  }> = [];

  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match && match[1] && match[2]) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      headings.push({ level, text, id });
    }
  }

  return headings;
}

export function extractTableOfContents(content: string): string {
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

export function addTableOfContents(content: string): string {
  const toc = extractTableOfContents(content);
  if (!toc) {
    return content;
  }

  const lines = content.split('\n');
  const firstHeadingIndex = lines.findIndex(line => line.match(/^#{1,6}\s+/));
  
  if (firstHeadingIndex === -1) {
    return content;
  }

  lines.splice(firstHeadingIndex + 1, 0, toc, '');
  return lines.join('\n');
}