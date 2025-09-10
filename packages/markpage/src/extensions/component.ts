import type { TokenizerAndRendererExtension } from 'marked';
import { Lexer, Marked } from 'marked';

const TAG = '[A-Z][A-Za-z0-9:_-]*';
const SELF = new RegExp(`^<(${TAG})\\s*([^>]*)\/>`);
const OPEN = new RegExp(`^<(${TAG})\\s*([^>]*)>`);

function parseProps(attrs: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (!attrs) return props;
  const re = /([a-zA-Z_][\w:-]*)=(?:"([^"]*)"|\{([\s\S]*?)\})|\b([a-zA-Z_][\w:-]*)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrs))) {
    const key = (m[1] || m[4]) as string;
    if (!key) continue;
    if (m[2] !== undefined) {
      props[key] = m[2];
    } else if (m[3] !== undefined) {
      try {
        props[key] = JSON.parse(m[3]);
      } catch {
        props[key] = m[3];
      }
    } else if (m[4] !== undefined) {
      props[key] = true;
    }
  }
  return props;
}

function findMatchingClose(src: string, name: string, startIndex: number): number {
  const openTag = new RegExp(`<${name}(?:\s[^>]*)?>`, 'g');
  // Handle both regular closing tags and HTML-encoded closing tags
  const closeTag = new RegExp(`(?:</${name}>|&lt;/${name}&gt;)`, 'g');
  openTag.lastIndex = startIndex;
  closeTag.lastIndex = startIndex;

  let depth = 1;
  while (true) {
    const nextOpen = openTag.exec(src);
    const nextClose = closeTag.exec(src);
    if (!nextClose) return -1;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      continue;
    }
    depth--;
    if (depth === 0) {
      return nextClose.index + nextClose[0].length;
    }
  }
}

// Create a function that returns the extension with access to the Marked instance
export function createComponentExtension(markedInstance?: Marked): TokenizerAndRendererExtension {
  return {
    name: 'component',
    level: 'block',
    start(src: string) {
      // Process components that are at the start of a line or indented (block-level)
      const i = src.search(/^\s*<[A-Z]/m);
      return i < 0 ? undefined : i;
    },
    tokenizer(src: string) {
      let m = SELF.exec(src);
      if (m) {
        const raw = m[0];
        const name = m[1] as string;
        const attrs = m[2] ?? '';
        return { type: 'component', raw, name, props: parseProps(attrs) } as any;
      }

      m = OPEN.exec(src);
      if (m) {
        const openRaw = m[0];
        const name = m[1] as string;
        const attrs = m[2] ?? '';
        const innerStart = openRaw.length;
        const endIndex = findMatchingClose(src, name, innerStart);
        if (endIndex > -1) {
          // For block-level components, we need to consume the entire line including trailing newlines
          // Find the end of the line after the component
          let lineEnd = endIndex;
          while (lineEnd < src.length && src[lineEnd] !== '\n') {
            lineEnd++;
          }
          // Include the newline if it exists
          if (lineEnd < src.length && src[lineEnd] === '\n') {
            lineEnd++;
          }
          const raw = src.slice(0, lineEnd);
          
          const inner = src.slice(innerStart, endIndex - (`</${name}>`.length));
          
          // Parse nested content safely - use simple markdown parsing to avoid parser state corruption
          let children: any[];
          if (inner.trim()) {
            try {
              // Use a simple approach: create a new Marked instance with basic extensions only
              // Use the existing Marked instance but parse without custom extensions
              // This prevents recursion while still parsing markdown correctly
              const nestedTokens = markedInstance?.lexer(inner) || [];
              
              // Flatten nested tokens into children array
              children = nestedTokens.flatMap((token: any) => {
                if (token.type === 'paragraph' && token.tokens) {
                  return token.tokens;
                }
                return [token];
              });
            } catch (error) {
              // Fallback to simple text token if parsing fails
              console.error('Component extension parsing error:', error);
              children = [{ type: 'text', raw: inner, text: inner.trim() }];
            }
          } else {
            children = [];
          }
          const token = { type: 'component', raw, name, props: parseProps(attrs), children } as any;
          return token;
        } else {
          // No matching close tag found - treat as self-closing component
          const raw = openRaw;
          return { type: 'component', raw, name, props: parseProps(attrs) } as any;
        }
      }
    },
  };
}

// Create an inline component extension for components within inline text
export function createInlineComponentExtension(markedInstance?: Marked): TokenizerAndRendererExtension {
  return {
    name: 'inline-component',
    level: 'inline',
    start(src: string) {
      const i = src.search(/<[A-Z]/);
      return i < 0 ? undefined : i;
    },
    tokenizer(src: string) {
      let m = SELF.exec(src);
      if (m) {
        const raw = m[0];
        const name = m[1] as string;
        const attrs = m[2] ?? '';
        return { type: 'component', raw, name, props: parseProps(attrs) } as any;
      }

      m = OPEN.exec(src);
      if (m) {
        const openRaw = m[0];
        const name = m[1] as string;
        const attrs = m[2] ?? '';
        const innerStart = openRaw.length;
        const endIndex = findMatchingClose(src, name, innerStart);
        if (endIndex > -1) {
          // For inline components, only consume up to the closing tag
          const raw = src.slice(0, endIndex + (`</${name}>`.length));
          
          const inner = src.slice(innerStart, endIndex - (`</${name}>`.length));
          
          // Parse nested content safely - use simple markdown parsing to avoid parser state corruption
          let children: any[];
          if (inner.trim()) {
            try {
              // Use a simple approach: create a new Marked instance with basic extensions only
              // Use the existing Marked instance but parse without custom extensions
              // This prevents recursion while still parsing markdown correctly
              const nestedTokens = markedInstance?.lexer(inner) || [];
              
              // Flatten nested tokens into children array
              children = nestedTokens.flatMap((token: any) => {
                if (token.type === 'paragraph' && token.tokens) {
                  return token.tokens;
                }
                return [token];
              });
            } catch (error) {
              // Fallback to simple text token if parsing fails
              console.error('Component extension parsing error:', error);
              children = [{ type: 'text', raw: inner, text: inner.trim() }];
            }
          } else {
            children = [];
          }
          const token = { type: 'component', raw, name, props: parseProps(attrs), children } as any;
          return token;
        } else {
          // No matching close tag found - treat as self-closing component
          const raw = openRaw;
          return { type: 'component', raw, name, props: parseProps(attrs) } as any;
        }
      }
    },
  };
}

// Default export for backward compatibility
export const componentExtension = createComponentExtension();
