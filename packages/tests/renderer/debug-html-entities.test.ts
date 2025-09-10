import { render } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import { Markdown, MarkpageOptions } from '@markpage/svelte';

describe('Debug HTML Entities', () => {
  test('should handle HTML entities in component tags', () => {
    const markdown = `
## Before

Content before.

<UnknownComponent variant="demo" title="This component doesn't exist">
  This content will be displayed as plain text
</UnknownComponent>

## After

Content after should still work.
`;

    const { container } = render(Markdown, {
      source: markdown
    });

    console.log('HTML entities test HTML:', container.innerHTML);

    // Check that both sections are rendered
    const headers = container.querySelectorAll('h2');
    expect(headers).toHaveLength(2);
    expect(headers[0]?.textContent).toContain('Before');
    expect(headers[1]?.textContent).toContain('After');
  });

  test('should handle raw component tags without HTML entities', () => {
    const markdown = `
## Before

Content before.

<UnknownComponent>
  This content will be displayed as plain text
</UnknownComponent>

## After

Content after should still work.
`;

    const { container } = render(Markdown, {
      source: markdown
    });

    console.log('Raw component test HTML:', container.innerHTML);

    // Check that both sections are rendered
    const headers = container.querySelectorAll('h2');
    expect(headers).toHaveLength(2);
    expect(headers[0]?.textContent).toContain('Before');
    expect(headers[1]?.textContent).toContain('After');
  });
});