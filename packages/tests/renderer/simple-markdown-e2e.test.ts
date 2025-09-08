import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown } from '@markpage/svelte';

describe('Svelte Markdown basic rendering', () => {
  it('renders headings, paragraphs, lists and links', async () => {
    const source = `
# Heading 1

Some paragraph text with a [link](https://example.com).

## Heading 2

- Item one
- Item two

`;

    const { container } = render(Markdown as any, { props: { source } });

    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toContain('Heading 1');

    const p = container.querySelector('p');
    expect(p?.textContent).toContain('Some paragraph text');
    const a = container.querySelector('a[href="https://example.com"]');
    expect(a).toBeTruthy();

    const h2 = container.querySelector('h2');
    expect(h2?.textContent).toContain('Heading 2');

    const items = Array.from(container.querySelectorAll('li')).map(li => li.textContent?.trim());
    expect(items).toEqual(['Item one', 'Item two']);
  });
});

