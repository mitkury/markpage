import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown } from '@markpage/svelte';
import OverrideCodeSpan from './components/OverrideCodeSpan.svelte';

// Using Svelte component to override built-in codespan

describe('Override built-in token with extensionComponents', () => {
  it('uses extensionComponents for built-in token type', async () => {
    const source = 'Inline `code` here';

    const extensionComponents = new Map<string, any>([
      ['codespan', OverrideCodeSpan]
    ]);

    const { container } = render(Markdown as any, { props: { source, extensionComponents } });

    const overridden = container.querySelector('code[data-overridden="true"]');
    expect(overridden).toBeTruthy();
    expect(overridden?.textContent).toBe('code');
  });
});

