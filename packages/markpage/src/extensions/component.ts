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
  const closeTag = new RegExp(`</${name}>`, 'g');
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

export const componentExtension: TokenizerAndRendererExtension = {
  name: 'component',
  level: 'block',
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
        // Use the same Marked instance that's currently parsing
        // This ensures nested components have access to the same component registry
        const lexer = new Lexer();
        const children = lexer.inlineTokens(inner);
        return { type: 'component', raw, name, props: parseProps(attrs), children } as any;
      }
    }
  },
};
