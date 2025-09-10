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
          const raw = src.slice(0, endIndex);
          const inner = src.slice(innerStart, endIndex - (`</${name}>`.length));
          
          // Use the provided Marked instance to parse nested content
          let children: any[];
          if (markedInstance) {
            // Use the existing Marked instance to parse nested content
            // This ensures that nested components are also parsed correctly
            const nestedTokens = markedInstance.lexer(inner);
            // For block-level components, we need to handle multiple types of nested content
            // If we have multiple tokens, we need to flatten them into a single children array
            if (nestedTokens.length > 0) {
              children = [];
              for (const token of nestedTokens) {
                if (token.type === 'paragraph' && (token as any).tokens) {
                  // Extract tokens from paragraph
                  children.push(...(token as any).tokens);
                } else if (token.type === 'component') {
                  // Direct component token
                  children.push(token);
                } else {
                  // Other token types
                  children.push(token);
                }
              }
            } else {
              children = [];
            }
          } else {
            // Fallback: create a new lexer without extensions
            const lexer = new Lexer();
            children = lexer.inlineTokens(inner);
          }
          return { type: 'component', raw, name, props: parseProps(attrs), children } as any;
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
          const raw = src.slice(0, endIndex);
          const inner = src.slice(innerStart, endIndex - (`</${name}>`.length));
          
          // Use the provided Marked instance to parse nested content
          let children: any[];
          if (markedInstance) {
            // Use the existing Marked instance to parse nested content
            // This ensures that nested components are also parsed correctly
            const nestedTokens = markedInstance.lexer(inner);
            // For block-level components, we need to handle multiple types of nested content
            // If we have multiple tokens, we need to flatten them into a single children array
            if (nestedTokens.length > 0) {
              children = [];
              for (const token of nestedTokens) {
                if (token.type === 'paragraph' && (token as any).tokens) {
                  // Extract tokens from paragraph
                  children.push(...(token as any).tokens);
                } else if (token.type === 'component') {
                  // Direct component token
                  children.push(token);
                } else {
                  // Other token types
                  children.push(token);
                }
              }
            } else {
              children = [];
            }
          } else {
            // Fallback: create a new lexer without extensions
            const lexer = new Lexer();
            children = lexer.inlineTokens(inner);
          }
          return { type: 'component', raw, name, props: parseProps(attrs), children } as any;
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
