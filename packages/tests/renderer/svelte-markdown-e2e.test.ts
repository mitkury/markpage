import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown } from '@markpage/svelte';

// Simple test components
import type { Component } from 'svelte';

const Button: Component = {
  render: (props: any) => ({
    html: `<button data-variant="${props?.variant ?? ''}">${props?.children ?? ''}</button>`
  }) as any
} as any;

const Alert: Component = {
  render: (props: any) => ({
    html: `<div role="alert" data-variant="${props?.variant ?? ''}">${props?.children ?? ''}</div>`
  }) as any
} as any;

describe('Svelte Markdown component tokens', () => {
  it('renders custom components parsed from markdown', async () => {
    const components = new Map<string, Component>([
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
});


