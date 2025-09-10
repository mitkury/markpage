import { render } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import { Markdown, MarkpageOptions } from '@markpage/svelte';

describe('Unregistered Components Breaking Parsing', () => {
  test.skip('should not break markdown parsing after unregistered components', () => {
    const markdown = `
## Before Components

This is content before components.

### Unknown Component Fallback

When a component isn't registered, it's rendered as plain text instead of showing an error:

<UnknownComponent variant="demo" title="This component doesn't exist">
  This content will be displayed as plain text
</UnknownComponent>

<AnotherMissingComponent size="large" />

Components are registered upfront and can receive props like \`variant\`, \`size\`, \`title\`, etc.

## After Components

This content should still be rendered correctly.

### Subsection

- **Test Suite**: Comprehensive examples in the [tests directory](https://github.com/mitkury/markpage/tree/main/packages/tests)
- **Another item**: This should also work
`;

    const { container } = render(Markdown, {
      source: markdown
    });

    console.log('Unregistered components test HTML:', container.innerHTML);

    // Check that content before components is rendered
    const beforeSection = container.querySelector('h2');
    expect(beforeSection?.textContent).toContain('Before Components');

    // Check that content after components is rendered
    const afterSection = container.querySelectorAll('h2')[1];
    expect(afterSection?.textContent).toContain('After Components');

    // Check that the subsection is rendered
    const subsection = container.querySelector('h3');
    expect(subsection?.textContent).toContain('Subsection');

    // Check that the list is rendered
    const list = container.querySelector('ul');
    expect(list).toBeTruthy();

    // Check that the list items are rendered
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(2);

    // Check that the link is rendered
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('https://github.com/mitkury/markpage/tree/main/packages/tests');
    expect(link?.textContent).toContain('tests directory');

    // Check that bold text is rendered
    const boldText = container.querySelector('strong');
    expect(boldText).toBeTruthy();
    expect(boldText?.textContent).toContain('Test Suite');
  });
});