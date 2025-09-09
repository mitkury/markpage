import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import OverrideCodeSpan from './components/OverrideCodeSpan.svelte';

// Using Svelte component to override built-in codespan

describe('Override built-in token with extensionComponents', () => {
  it('uses overrideBuiltinToken for built-in token type with MarkpageOptions API', async () => {
    const source = 'Inline `code` here';

    const options = new MarkpageOptions()
      .overrideBuiltinToken('codespan', OverrideCodeSpan);

    const { container } = render(Markdown as any, { props: { source, options } });

    const overridden = container.querySelector('code[data-overridden="true"]');
    expect(overridden).toBeTruthy();
    expect(overridden?.textContent).toBe('code');
  });

  it('uses manual extensionComponents for built-in token type with MarkpageOptions API', async () => {
    const source = 'Inline `code` here';

    const options = new MarkpageOptions();
    // Alternative: manually add the extension component
    const extensionComponents = options.getExtensionComponents();
    extensionComponents.set('codespan', OverrideCodeSpan);

    const { container } = render(Markdown as any, { props: { source, options } });

    const overridden = container.querySelector('code[data-overridden="true"]');
    expect(overridden).toBeTruthy();
    expect(overridden?.textContent).toBe('code');
  });
});

