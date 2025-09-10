import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import Alert from '../../website/src/lib/components/Alert.svelte';

describe('Debug Alert Rendering', () => {
  it('should render Alert component with processed markdown tokens', () => {
    const markdown = `<Alert variant="info">
  This alert contains **markdown** content:
  
  - List items work
  - **Bold text** works
  - [Links](https://example.com) work too
</Alert>`;

    const options = new MarkpageOptions()
      .addCustomComponent('Alert', Alert);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Debug: log the actual HTML content
    console.log('Rendered HTML:', container.innerHTML);

    // Check that alert is rendered
    const alert = container.querySelector('.alert');
    expect(alert).toBeTruthy();
    
    // Check that markdown content is processed
    const alertContent = container.querySelector('.alert-content');
    expect(alertContent).toBeTruthy();
    
    // The content should contain processed HTML, not raw markdown
    expect(alertContent?.textContent).toContain('markdown');
    expect(alertContent?.textContent).toContain('Bold text');
    expect(alertContent?.textContent).toContain('Links');
    
    // These SHOULD exist if markdown was processed correctly
    const boldElements = alertContent?.querySelectorAll('strong');
    expect(boldElements?.length).toBeGreaterThan(0);
    
    const links = alertContent?.querySelectorAll('a');
    expect(links?.length).toBeGreaterThan(0);
    
    const listItems = alertContent?.querySelectorAll('li');
    expect(listItems?.length).toBeGreaterThan(0);
  });
});