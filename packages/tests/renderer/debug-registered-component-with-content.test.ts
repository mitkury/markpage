import { render } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import Button from './components/Button.svelte';

describe('Debug Registered Component With Content', () => {
  test('should handle registered component with content without breaking parsing', () => {
    const markdown = `
## Before

Content before the component.

<Button variant="primary">Primary Button</Button>

## After

Content after should still work.
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    console.log('Registered component with content test HTML:', container.innerHTML);

    // Check that both sections are rendered
    const headers = container.querySelectorAll('h2');
    expect(headers).toHaveLength(2);
    expect(headers[0]?.textContent).toContain('Before');
    expect(headers[1]?.textContent).toContain('After');
  });

  test('should handle self-closing registered component without breaking parsing', () => {
    const markdown = `
## Before

Content before the component.

<TestButton variant="primary" text="Primary Button" />

## After

Content after should still work.
`;

    const options = new MarkpageOptions()
      .addCustomComponent('TestButton', Button);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    console.log('Self-closing component test HTML:', container.innerHTML);

    // Check that both sections are rendered
    const headers = container.querySelectorAll('h2');
    expect(headers).toHaveLength(2);
    expect(headers[0]?.textContent).toContain('Before');
    expect(headers[1]?.textContent).toContain('After');
  });

  test('should handle both types of components in sequence', () => {
    const markdown = `
## Before

Content before components.

<TestButton variant="primary" text="Primary Button" />

<Button variant="primary">Primary Button</Button>

## After

Content after should still work.
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('TestButton', Button);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    console.log('Both components test HTML:', container.innerHTML);

    // Check that both sections are rendered
    const headers = container.querySelectorAll('h2');
    expect(headers).toHaveLength(2);
    expect(headers[0]?.textContent).toContain('Before');
    expect(headers[1]?.textContent).toContain('After');
  });
});