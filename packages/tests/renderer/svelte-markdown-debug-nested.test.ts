import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import Button from './components/Button.svelte';
import Alert from './components/Alert.svelte';

describe('Debug Nested Components', () => {
  it('should render a simple button', () => {
    const markdown = `<Button variant="primary">Simple Button</Button>`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    console.log('Simple Button Container HTML:', container.innerHTML);
    
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.textContent).toContain('Simple Button');
  });

  it('should render button in a list item', () => {
    const markdown = `- List item with <Button variant="primary">List Button</Button>`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    console.log('List Button Container HTML:', container.innerHTML);
    
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.textContent).toContain('List Button');
  });

  it.skip('should render alert with button inside', () => {
    const markdown = `<Alert variant="info">Alert with <Button variant="primary">Nested Button</Button></Alert>`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Alert', Alert);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    console.log('Nested Button Container HTML:', container.innerHTML);
    
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.textContent).toContain('Nested Button');
    
    const alerts = container.querySelectorAll('[role="alert"]');
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.textContent).toContain('Alert with');
  });
});
