import { render } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import { Markdown } from '@markpage/svelte';

describe('File Protocol Links with Spaces', () => {
  test('should render file:/// link with spaces when wrapped in angle brackets', () => {
    const markdown = `[@cartoon ginger cat](<file:///assets/cats/cartoon ginger cat>)`;

    const { container } = render(Markdown, {
      source: markdown
    });

    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('file:///assets/cats/cartoon ginger cat');
  });

  test('should render relative link with spaces when wrapped in angle brackets', () => {
    const markdown = `[@cartoon ginger cat](</cats/cartoon ginger cat>)`;

    const { container } = render(Markdown, {
      source: markdown
    });

    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('/cats/cartoon ginger cat');
  });

  test('should render file:/// link without spaces (no angle brackets needed)', () => {
    const markdown = `[@cartoon ginger cat](file:///assets/cats/cartoon-ginger-cat)`;

    const { container } = render(Markdown, {
      source: markdown
    });

    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('file:///assets/cats/cartoon-ginger-cat');
  });
});

