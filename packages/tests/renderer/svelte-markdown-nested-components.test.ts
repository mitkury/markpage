import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import Button from './components/Button.svelte';
import Alert from './components/Alert.svelte';
import Card from './components/Card.svelte';

describe('Nested Custom Components', () => {
  it('should render custom components inside list items', () => {
    const markdown = `
# Test List with Components

1. First item with button: <Button variant="primary">Click me</Button>
2. Second item with alert: <Alert variant="info">Alert in list</Alert>
3. Third item with multiple elements:
   - <Button variant="success">Success</Button>
   - <Alert variant="warning">Warning in nested list</Alert>
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Alert', Alert);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Check that buttons are rendered in list items
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.textContent).toContain('Click me');
    expect(buttons[1]?.textContent).toContain('Success');
    
    // Check that alerts are rendered in list items
    const alerts = container.querySelectorAll('[role="alert"]');
    expect(alerts).toHaveLength(2);
    expect(alerts[0]?.textContent).toContain('Alert in list');
    expect(alerts[1]?.textContent).toContain('Warning in nested list');
  });

  it.skip('should render custom components inside other custom components', () => {
    // TODO: Fix complex nested components - see docs/proposals/nested-components-limitations.md
    // Issue: Alert component inside Card renders as raw HTML <alert> instead of processed component
    const markdown = `
<Card title="Nested Test" subtitle="Testing components within components">
  This card contains:
  
  <Button variant="primary">Button in Card</Button>
  
  <Alert variant="success">
    This alert is inside a card component!
    
    And it has another button: <Button variant="secondary">Nested Button</Button>
  </Alert>
</Card>
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Alert', Alert)
      .addCustomComponent('Card', Card);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    
    // Check that card is rendered
    const card = container.querySelector('.card');
    expect(card).toBeTruthy();
    expect(card?.textContent).toContain('Nested Test');
    expect(card?.textContent).toContain('Testing components within components');

    // Check that buttons are rendered inside the card
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.textContent).toContain('Button in Card');
    expect(buttons[1]?.textContent).toContain('Nested Button');

    // Check that alert is rendered inside the card
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('This alert is inside a card component!');
  });

  it.skip('should handle deep nesting of custom components', () => {
    // TODO: Fix complex nested components - see docs/proposals/nested-components-limitations.md
    // Issue: Alert component renders as raw HTML <alert> instead of processed component
    const markdown = `
<Alert variant="warning">
  This is a warning alert that contains:
  
  <Card title="Card in Alert" subtitle="Deep nesting test">
    <Button variant="primary">Button in Card in Alert</Button>
    
    <Alert variant="success">
      Alert in Card in Alert with button: <Button variant="secondary">Deep Button</Button>
    </Alert>
  </Card>
</Alert>
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Alert', Alert)
      .addCustomComponent('Card', Card);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Check outer alert
    const outerAlert = container.querySelector('[role="alert"][data-variant="warning"]');
    expect(outerAlert).toBeTruthy();
    expect(outerAlert?.textContent).toContain('This is a warning alert that contains:');

    // Check card inside alert
    const card = container.querySelector('.card');
    expect(card).toBeTruthy();
    expect(card?.textContent).toContain('Card in Alert');

    // Check buttons (should be 2 total)
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.textContent).toContain('Button in Card in Alert');
    expect(buttons[1]?.textContent).toContain('Deep Button');

    // Check inner alert
    const innerAlert = container.querySelector('[role="alert"][data-variant="success"]');
    expect(innerAlert).toBeTruthy();
    expect(innerAlert?.textContent).toContain('Alert in Card in Alert with button:');
  });

  it.skip('should render mixed content in lists with custom components', () => {
    // TODO: Fix complex nested components - see docs/proposals/nested-components-limitations.md
    // Issue: Alert component in list renders as raw HTML <alert> instead of processed component
    const markdown = `
- Regular text item
- Item with **bold text** and <Button variant="primary">Button</Button>
- Item with:
  - Nested list item with <Alert variant="info">Alert</Alert>
  - Another nested item with <Button variant="success">Success Button</Button>
- Final item with <Card title="Mini Card" subtitle="In list item">
    <Button variant="danger">Card Button</Button>
  </Card>
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Alert', Alert)
      .addCustomComponent('Card', Card);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Check that we have the right number of buttons
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(4);
    expect(buttons[0]?.textContent).toContain('Button');
    expect(buttons[1]?.textContent).toContain('Success Button');
    expect(buttons[2]?.textContent).toContain('Card Button');

    // Check that alert is rendered in nested list
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('Alert');

    // Check that card is rendered in list item
    const card = container.querySelector('.card');
    expect(card).toBeTruthy();
    expect(card?.textContent).toContain('Mini Card');
    expect(card?.textContent).toContain('In list item');

    // Check that bold text is preserved
    const boldText = container.querySelector('strong');
    expect(boldText).toBeTruthy();
    expect(boldText?.textContent).toContain('bold text');
  });

  it.skip('should render components inside paragraphs', () => {
    const markdown = `
This is a paragraph with a <Button variant="primary">button</Button> in it.

Another paragraph with an <Alert variant="info">alert</Alert> and more text.
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Alert', Alert);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // TODO: Fix paragraph component rendering - see docs/proposals/nested-components-limitations.md

    // Check that buttons are rendered in paragraphs
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.textContent).toContain('button');

    // Check that alerts are rendered in paragraphs
    const alerts = container.querySelectorAll('[role="alert"]');
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.textContent).toContain('alert');

    // Check that paragraph text is preserved
    expect(container.textContent).toContain('This is a paragraph with a');
    expect(container.textContent).toContain('in it');
    expect(container.textContent).toContain('Another paragraph with an');
    expect(container.textContent).toContain('and more text');
  });

  it('should render components inside blockquotes', () => {
    const markdown = `
> This is a blockquote with a <Button variant="primary">button</Button> in it.
> 
> And another line with an <Alert variant="warning">alert</Alert>.
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Alert', Alert);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Check that buttons are rendered in blockquotes
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.textContent).toContain('button');

    // Check that alerts are rendered in blockquotes
    const alerts = container.querySelectorAll('[role="alert"]');
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.textContent).toContain('alert');

    // Check that blockquote is rendered
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeTruthy();
  });

  it.skip('should handle self-closing components in nested contexts', () => {
    // TODO: Fix complex nested components - see docs/proposals/nested-components-limitations.md
    // Issue: Self-closing components in nested contexts render as raw HTML instead of processed components
    const markdown = `
<Card title="Self-closing Test">
  This card has a self-closing button: <Button variant="primary" />
  
  And a regular button: <Button variant="secondary">Regular Button</Button>
</Card>
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Card', Card);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Check that both buttons are rendered
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.textContent).toContain('Regular Button');

    // Check that card is rendered
    const card = container.querySelector('.card');
    expect(card).toBeTruthy();
    expect(card?.textContent).toContain('Self-closing Test');
  });

  it.skip('should preserve component props in nested contexts', () => {
    // TODO: Fix complex nested components - see docs/proposals/nested-components-limitations.md
    // Issue: Component props not preserved in nested contexts, components render as raw HTML
    const markdown = `
<Alert variant="error" data-test="nested-alert">
  This alert has props and contains: <Button variant="danger" data-test="nested-button">Danger Button</Button>
</Alert>
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Alert', Alert);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Check that alert has correct props
    const alert = container.querySelector('[role="alert"][data-variant="error"]');
    expect(alert).toBeTruthy();
    expect(alert?.getAttribute('data-test')).toBe('nested-alert');

    // Check that button has correct props
    const button = container.querySelector('button[data-variant="danger"]');
    expect(button).toBeTruthy();
    expect(button?.getAttribute('data-test')).toBe('nested-button');
    expect(button?.textContent).toContain('Danger Button');
  });
});
