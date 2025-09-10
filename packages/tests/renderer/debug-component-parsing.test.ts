import { render } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import { Markdown, MarkpageOptions } from '@markpage/svelte';

describe('Debug Component Parsing', () => {
  test('should handle unregistered components without breaking parsing', () => {
    const markdown = `
## Before

Content before components.

<UnknownComponent>
  Some content
</UnknownComponent>

## After

Content after components should still work.
`;

    const { container } = render(Markdown, {
      source: markdown
    });

    console.log('Debug test HTML:', container.innerHTML);

    // Check that both sections are rendered
    const headers = container.querySelectorAll('h2');
    expect(headers).toHaveLength(2);
    expect(headers[0]?.textContent).toContain('Before');
    expect(headers[1]?.textContent).toContain('After');
  });
});