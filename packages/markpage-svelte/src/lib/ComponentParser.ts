import type { ComponentNode, ParsedContent } from './types.js';

/**
 * Parser for extracting component-like tags from an HTML string produced by a
 * markdown parser (e.g. output of `marked.parse`).
 *
 * How it works (briefly):
 * 1) We receive an HTML string (not raw markdown)
 * 2) We precompute ranges of <pre>...</pre> and <code>...</code> to avoid
 *    parsing examples/code as components
 * 3) A regex scans for capitalized tags (e.g. <TestButton ...>...</TestButton>
 *    or self-closing <TestButton .../>) outside code ranges
 * 4) We emit a flat sequence of text and component items, preserving order
 */
export class ComponentParser {
  private componentRegex = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;

  /**
   * Parse HTML content and extract components
   */
  parse(content: string): ParsedContent[] {
    const result: ParsedContent[] = [];
    let lastIndex = 0;
    // Reset regex state
    this.componentRegex.lastIndex = 0;

    // Detect HTML code regions (<pre>...</pre> and <code>...</code>)
    // Components inside these regions should be ignored and treated as text
    const codeRanges: Array<{ start: number; end: number }> = [];
    const pushRanges = (regex: RegExp) => {
      let m: RegExpExecArray | null;
      regex.lastIndex = 0;
      while ((m = regex.exec(content)) !== null) {
        codeRanges.push({ start: m.index, end: m.index + m[0].length });
      }
    };
    pushRanges(/<pre[\s\S]*?<\/pre>/gi);
    pushRanges(/<code[\s\S]*?<\/code>/gi);
    const isInsideCode = (start: number, end: number) =>
      codeRanges.some((r) => start >= r.start && end <= r.end);

    let match;
    while ((match = this.componentRegex.exec(content)) !== null) {
      const [fullMatch, componentName, propsString, children] = match;
      const start = match.index;
      const end = start + fullMatch.length;

      // Add text before component
      if (start > lastIndex) {
        result.push({
          type: 'text',
          content: content.slice(lastIndex, start)
        });
      }

      // Only parse as component if not inside code/pre regions
      if (!isInsideCode(start, end)) {
        // Parse props
        const props = this.parseProps(propsString);

        // Add component
        result.push({
          type: 'component',
          content: {
            name: componentName,
            props,
            children: children?.trim(),
            position: { start, end }
          }
        });
      } else {
        // Treat as regular text if inside code block
        result.push({
          type: 'text',
          content: fullMatch
        });
      }

      lastIndex = end;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return result;
  }

  /**
   * Extract only component nodes from content
   */
  extractComponents(content: string): ComponentNode[] {
    return this.parse(content)
      .filter(item => item.type === 'component')
      .map(item => item.content as ComponentNode);
  }

  /**
   * Parse component props string into object
   */
  private parseProps(propsString: string): Record<string, any> {
    const props: Record<string, any> = {};
    
    if (!propsString.trim()) return props;

    // Match prop patterns: name="value", name='value', name=value, name
    const propRegex = /(\w+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
    
    let propMatch;
    while ((propMatch = propRegex.exec(propsString)) !== null) {
      const [, name, doubleQuoted, singleQuoted, unquoted] = propMatch;
      
      if (doubleQuoted !== undefined) {
        props[name] = doubleQuoted;
      } else if (singleQuoted !== undefined) {
        props[name] = singleQuoted;
      } else if (unquoted !== undefined) {
        // Try to convert to appropriate type
        props[name] = this.convertPropValue(unquoted);
      } else {
        // Boolean prop (e.g., "disabled")
        props[name] = true;
      }
    }

    return props;
  }

  /**
   * Convert prop value to appropriate type
   */
  private convertPropValue(value: string): any {
    // Boolean values
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Numbers
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return Number(value);
    }
    
    // Strings (default)
    return value;
  }

  /**
   * Check if content contains any components
   */
  hasComponents(content: string): boolean {
    this.componentRegex.lastIndex = 0;
    return this.componentRegex.test(content);
  }
}