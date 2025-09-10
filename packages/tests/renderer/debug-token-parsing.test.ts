import { describe, it, expect } from 'vitest';
import { newMarked } from '@markpage/svelte';

describe('Debug Token Parsing', () => {
  it('should parse Alert component with markdown content correctly', () => {
    const markdown = `<Alert variant="info">
  This alert contains **markdown** content:
  
  - List items work
  - **Bold text** works
  - [Links](https://example.com) work too
</Alert>`;

    const md = newMarked();
    const tokens = md.lexer(markdown);

    console.log('Parsed tokens:', JSON.stringify(tokens, null, 2));

    // Check that we have a component token
    const componentToken = tokens.find(token => token.type === 'component');
    expect(componentToken).toBeTruthy();
    expect(componentToken?.name).toBe('Alert');
    expect(componentToken?.props?.variant).toBe('info');

    // Check that the component has children tokens
    expect(componentToken?.children).toBeTruthy();
    expect(componentToken?.children?.length).toBeGreaterThan(0);

    // Check that the children contain markdown tokens (not raw text)
    const hasStrongToken = componentToken?.children?.some(child => child.type === 'strong');
    const hasListToken = componentToken?.children?.some(child => child.type === 'list');
    const hasLinkToken = componentToken?.children?.some(child => child.type === 'link');

    console.log('Has strong token:', hasStrongToken);
    console.log('Has list token:', hasListToken);
    console.log('Has link token:', hasLinkToken);

    // These should be true if markdown is being parsed correctly
    expect(hasStrongToken).toBe(true);
    expect(hasListToken).toBe(true);
    expect(hasLinkToken).toBe(true);
  });
});