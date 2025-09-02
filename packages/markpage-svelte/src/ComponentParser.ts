import type { ComponentNode, ParsedContent } from './types.js';

/**
 * Parser for extracting components from markdown content
 */
export class ComponentParser {
  private componentRegex = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;

  /**
   * Parse markdown content and extract components
   */
  parse(content: string): ParsedContent[] {
    const result: ParsedContent[] = [];
    let lastIndex = 0;
    let inCodeBlock = false;
    let inInlineCode = false;

    // Reset regex state
    this.componentRegex.lastIndex = 0;

    let match;
    while ((match = this.componentRegex.exec(content)) !== null) {
      const [fullMatch, componentName, propsString, children] = match;
      const start = match.index;
      const end = start + fullMatch.length;

      // Check if we're inside a code block or inline code
      const beforeMatch = content.slice(0, start);
      const codeBlockMatches = beforeMatch.match(/```/g);
      const inlineCodeMatches = beforeMatch.match(/`/g);
      
      if (codeBlockMatches) {
        inCodeBlock = codeBlockMatches.length % 2 === 1; // Odd number means we're inside
      }
      
      if (inlineCodeMatches) {
        inInlineCode = inlineCodeMatches.length % 2 === 1; // Odd number means we're inside
      }

      // Add text before component
      if (start > lastIndex) {
        result.push({
          type: 'text',
          content: content.slice(lastIndex, start)
        });
      }

      // Only parse as component if not inside code blocks
      if (!inCodeBlock && !inInlineCode) {
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