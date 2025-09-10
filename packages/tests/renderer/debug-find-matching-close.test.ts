import { render } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import { Markdown, MarkpageOptions } from '@markpage/svelte';

describe('Debug Find Matching Close', () => {
  test('should handle component with no close tag', () => {
    const markdown = `
## Before

Content before.

<UnknownComponent>
  Some content

## After

Content after.
`;

    const { container } = render(Markdown, {
      source: markdown
    });

    console.log('Find matching close test HTML:', container.innerHTML);

    // Check that both sections are rendered
    const headers = container.querySelectorAll('h2');
    expect(headers).toHaveLength(2);
    expect(headers[0]?.textContent).toContain('Before');
    expect(headers[1]?.textContent).toContain('After');
  });
});