import { describe, it, expect } from 'vitest';

// Copy the findMatchingClose function for testing
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

describe('Debug findMatchingClose', () => {
  it('should find matching close tag correctly', () => {
    const src = `<Button variant="primary">Click me</Button>

**After component:** This should also be bold.`;

    console.log('Source:', JSON.stringify(src));
    
    const openTagMatch = /<Button\s*([^>]*)>/.exec(src);
    if (openTagMatch) {
      console.log('Open tag match:', openTagMatch);
      const openTagLength = openTagMatch[0].length;
      console.log('Open tag length:', openTagLength);
      
      const endIndex = findMatchingClose(src, 'Button', openTagLength);
      console.log('End index:', endIndex);
      
      if (endIndex > -1) {
        const consumed = src.slice(0, endIndex);
        console.log('Consumed content:', JSON.stringify(consumed));
        console.log('Remaining content:', JSON.stringify(src.slice(endIndex)));
      }
    }
  });
});