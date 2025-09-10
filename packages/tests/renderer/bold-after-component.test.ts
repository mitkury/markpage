import { describe, it, expect } from 'vitest';
import { newMarked } from '@markpage/svelte';

describe('Bold After Component Issue', () => {
  it('should render bold text correctly after custom component usage', () => {
    const markdown = `**Before component:** This should be bold.

<Button variant="primary">Click me</Button>

**After component:** This should also be bold.

Some text with **bold** content after component.`;

    const md = newMarked();
    const tokens = md.lexer(markdown);

    console.log('Parsed tokens:', JSON.stringify(tokens, null, 2));

    // Check that we have bold tokens (nested in paragraphs)
    const boldTokens = tokens
      .filter(token => token.type === 'paragraph')
      .flatMap(paragraph => paragraph.tokens?.filter(token => token.type === 'strong') || []);
    
    console.log('Bold tokens found:', boldTokens.length);
    console.log('Bold tokens:', boldTokens);

    // Should have 3 bold tokens: "Before component:", "After component:", and "bold"
    expect(boldTokens.length).toBe(3);
    
    // Check specific bold tokens
    const beforeComponent = boldTokens.find(token => token.text === 'Before component:');
    expect(beforeComponent).toBeTruthy();
    
    const afterComponent = boldTokens.find(token => token.text === 'After component:');
    expect(afterComponent).toBeTruthy();
    
    const boldContent = boldTokens.find(token => token.text === 'bold');
    expect(boldContent).toBeTruthy();
  });

  it('should render bold text correctly without components', () => {
    const markdown = `**Before:** This should be bold.

Some text with **bold** content.`;

    const md = newMarked();
    const tokens = md.lexer(markdown);

    console.log('No component test tokens:', JSON.stringify(tokens, null, 2));

    // Check that we have bold tokens (nested in paragraphs)
    const boldTokens = tokens
      .filter(token => token.type === 'paragraph')
      .flatMap(paragraph => paragraph.tokens?.filter(token => token.type === 'strong') || []);
    
    console.log('Bold tokens found (no component):', boldTokens.length);
    console.log('Bold tokens (no component):', boldTokens);

    // Should have 2 bold tokens: "Before:" and "bold"
    expect(boldTokens.length).toBe(2);
  });
});