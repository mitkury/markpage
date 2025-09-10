import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import Alert from '../../website/src/lib/components/Alert.svelte';

/**
 * Tests for Alert component markdown rendering behavior.
 * 
 * Key findings:
 * 1. Markdown content in children IS processed correctly (working as expected)
 * 2. Markdown content in text prop is NOT processed (by design - text prop expects HTML)
 * 3. HTML content in text prop has a bug - it's processed as markdown instead of being passed to component
 */
describe('Alert Markdown Rendering', () => {
  it('should render markdown content inside Alert component', () => {
    const markdown = `
<Alert variant="info">
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

    // Check that alert is rendered
    const alert = container.querySelector('.alert');
    expect(alert).toBeTruthy();
    
    // Check that markdown content IS processed correctly
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
    
    // Verify specific content
    expect(boldElements?.[0]?.textContent).toBe('markdown');
    expect(boldElements?.[1]?.textContent).toBe('Bold text');
    expect(links?.[0]?.getAttribute('href')).toBe('https://example.com');
    expect(links?.[0]?.textContent).toBe('Links');
  });

  it('should NOT process markdown when using text prop (by design)', () => {
    // This test documents the expected behavior: text prop accepts raw HTML, not markdown
    const markdown = `
<Alert variant="info" text="This alert contains **markdown** content:
  
- List items work
- **Bold text** works
- [Links](https://example.com) work too" />`;

    const options = new MarkpageOptions()
      .addCustomComponent('Alert', Alert);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Check that alert is rendered
    const alert = container.querySelector('.alert');
    expect(alert).toBeTruthy();
    
    // Check that markdown content is NOT processed when using text prop (by design)
    const alertContent = container.querySelector('.alert-content');
    expect(alertContent).toBeTruthy();
    
    // The content should contain raw markdown text, not processed HTML
    // This is the expected behavior - text prop is for HTML content
    expect(alertContent?.textContent).toContain('**markdown**');
    expect(alertContent?.textContent).toContain('**Bold text**');
    expect(alertContent?.textContent).toContain('[Links](https://example.com)');
    
    // These should NOT exist because markdown is not processed in text prop
    const boldElements = alertContent?.querySelectorAll('strong');
    expect(boldElements?.length).toBe(0);
    
    const links = alertContent?.querySelectorAll('a');
    expect(links?.length).toBe(0);
    
    const listItems = alertContent?.querySelectorAll('li');
    expect(listItems?.length).toBe(0);
  });

  it('should demonstrate the text prop bug (HTML content not passed to component)', () => {
    // This test documents a bug: HTML content in text prop is processed as markdown instead of being passed to the component
    const markdown = `<Alert variant="info" text="This alert contains <strong>HTML</strong> content" />`;

    const options = new MarkpageOptions()
      .addCustomComponent('Alert', Alert);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });

    // Check that alert is rendered
    const alert = container.querySelector('.alert');
    expect(alert).toBeTruthy();
    
    // Check that the alert content is empty (this is the bug)
    const alertContent = container.querySelector('.alert-content');
    expect(alertContent).toBeTruthy();
    expect(alertContent?.textContent).toBe(''); // Should be empty because text prop is not working
    
    // The HTML content is rendered outside the Alert component (this is the bug)
    const paragraph = container.querySelector('p');
    expect(paragraph).toBeTruthy();
    expect(paragraph?.textContent).toContain('HTML');
  });
});