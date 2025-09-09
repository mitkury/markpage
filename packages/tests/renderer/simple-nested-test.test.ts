import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import Button from './components/Button.svelte';

describe('Simple Nested Test', () => {
  it('should render a simple button in a list', () => {
    const markdown = `- List item with <Button variant="primary">Click me</Button>`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    console.log('Container HTML:', container.innerHTML);
    
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.textContent).toContain('Click me');
  });
});
