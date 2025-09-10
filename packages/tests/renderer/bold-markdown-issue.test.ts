import { describe, it, expect } from 'vitest';
import { newMarked } from '@markpage/svelte';

describe('Bold Markdown Issue', () => {
  it('should render bold text correctly in various contexts', () => {
    const markdown = `**Markdown source:**

\`\`\`markdown
<Button variant="primary">Primary Button</Button>
\`\`\`

**Rendered result:**

<Button variant="primary">Primary Button</Button>

Some other text with **bold** content.`;

    const md = newMarked();
    const tokens = md.lexer(markdown);

    console.log('Parsed tokens:', JSON.stringify(tokens, null, 2));

    // Check that we have bold tokens (nested in paragraphs)
    const boldTokens = tokens
      .filter(token => token.type === 'paragraph')
      .flatMap(paragraph => paragraph.tokens?.filter(token => token.type === 'strong') || []);
    console.log('Bold tokens found:', boldTokens.length);
    console.log('Bold tokens:', boldTokens);

    // Should have at least 2 bold tokens: "Markdown source:" and "Rendered result:"
    expect(boldTokens.length).toBeGreaterThanOrEqual(2);
    
    // Check that the first bold token is "Markdown source:"
    const firstBoldToken = boldTokens.find(token => token.text === 'Markdown source:');
    expect(firstBoldToken).toBeTruthy();
    
    // Check that the second bold token is "Rendered result:"
    const secondBoldToken = boldTokens.find(token => token.text === 'Rendered result:');
    expect(secondBoldToken).toBeTruthy();
  });

  it('should render bold text in simple paragraph', () => {
    const markdown = `**Markdown source:**`;

    const md = newMarked();
    const tokens = md.lexer(markdown);

    console.log('Simple bold test tokens:', JSON.stringify(tokens, null, 2));

    // Should have exactly one bold token (nested in paragraph)
    const boldTokens = tokens
      .filter(token => token.type === 'paragraph')
      .flatMap(paragraph => paragraph.tokens?.filter(token => token.type === 'strong') || []);
    expect(boldTokens.length).toBe(1);
    expect(boldTokens[0].text).toBe('Markdown source:');
  });
});