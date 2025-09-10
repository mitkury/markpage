import { render } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import Button from './components/Button.svelte';

describe('Critical Bug Verification', () => {
  test('CRITICAL: Components with content should not break subsequent markdown parsing', () => {
    const markdown = `
# Before Component

This is content before the component.

<Button variant="primary">Primary Button</Button>

# After Component  

This content should render correctly after the component.

## Subsection

- List item 1
- List item 2
- **Bold text** with [link](https://example.com)

> This is a blockquote that should also work.

Another paragraph with *italic* text.
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Verify the button rendered
    const button = container.querySelector('button[data-variant="primary"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Primary Button');

    // CRITICAL: Verify content after component renders correctly
    const headers = container.querySelectorAll('h1, h2');
    expect(headers).toHaveLength(3); // Before, After, Subsection
    expect(headers[0]?.textContent).toContain('Before Component');
    expect(headers[1]?.textContent).toContain('After Component');
    expect(headers[2]?.textContent).toContain('Subsection');

    // Verify list rendered
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(3);

    // Verify formatting works
    const bold = container.querySelector('strong');
    expect(bold?.textContent).toContain('Bold text');

    const link = container.querySelector('a[href="https://example.com"]');
    expect(link).toBeTruthy();

    const blockquote = container.querySelector('blockquote');
    expect(blockquote?.textContent).toContain('This is a blockquote');

    const italic = container.querySelector('em');
    expect(italic?.textContent).toContain('italic');
  });

  test('CRITICAL: Unregistered components with content should not break subsequent markdown parsing', () => {
    const markdown = `
# Before Component

Content before unregistered component.

<UnknownComponent variant="demo">
  This component doesn't exist
</UnknownComponent>

# After Component

This content should render correctly.

## Another Section

- Item 1
- Item 2
`;

    const { container } = render(Markdown, {
      source: markdown
    });

    // Verify fallback component rendered
    const fallback = container.querySelector('.component-fallback');
    expect(fallback).toBeTruthy();

    // CRITICAL: Verify content after component renders correctly
    const headers = container.querySelectorAll('h1, h2');
    expect(headers).toHaveLength(3);
    expect(headers[0]?.textContent).toContain('Before Component');
    expect(headers[1]?.textContent).toContain('After Component');
    expect(headers[2]?.textContent).toContain('Another Section');

    // Verify list rendered  
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(2);
  });
});