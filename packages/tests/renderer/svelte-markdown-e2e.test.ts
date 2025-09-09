import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import Button from './components/Button.svelte';
import Alert from './components/Alert.svelte';

describe('Svelte Markdown component tokens', () => {
  it('renders custom components parsed from markdown using legacy props', async () => {
    const components = new Map<string, any>([
      ['Button', Button],
      ['Alert', Alert]
    ]);

    const source = `
## Test

<Button variant="primary">Click</Button>

<Alert variant="info">Info message</Alert>
`;

    const { container, findByText } = render(Markdown as any, { props: { source, components } });

    // Should render actual elements, not raw tags
    const btn = container.querySelector('button[data-variant="primary"]');
    expect(btn).toBeTruthy();
    expect(btn?.textContent).toContain('Click');

    const alert = container.querySelector('div[role="alert"][data-variant="info"]');
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('Info message');
  });

  it('renders custom components using new MarkpageOptions API', async () => {
    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button)
      .addCustomComponent('Alert', Alert);

    const source = `
## Test

<Button variant="primary">Click</Button>

<Alert variant="info">Info message</Alert>
`;

    const { container, findByText } = render(Markdown as any, { props: { source, options } });

    // Should render actual elements, not raw tags
    const btn = container.querySelector('button[data-variant="primary"]');
    expect(btn).toBeTruthy();
    expect(btn?.textContent).toContain('Click');

    const alert = container.querySelector('div[role="alert"][data-variant="info"]');
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('Info message');
  });
});


