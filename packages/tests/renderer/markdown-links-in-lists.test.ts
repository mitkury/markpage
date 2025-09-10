import { render } from '@testing-library/svelte';
import { expect, test, describe } from 'vitest';
import { Markdown, MarkpageOptions } from '@markpage/svelte';
import Button from './components/Button.svelte';

describe('Markdown Links in Lists', () => {
  test('should render markdown links inside list items', () => {
    const markdown = `- **Test Suite**: Comprehensive examples in the [tests directory](https://github.com/mitkury/markpage/tree/main/packages/tests)`;

    const { container } = render(Markdown, {
      source: markdown
    });


    // Check that the list is rendered
    const list = container.querySelector('ul');
    expect(list).toBeTruthy();

    // Check that the list item is rendered
    const listItem = container.querySelector('li');
    expect(listItem).toBeTruthy();

    // Check that the bold text is rendered
    const boldText = container.querySelector('strong');
    expect(boldText).toBeTruthy();
    expect(boldText?.textContent).toContain('Test Suite');

    // Check that the link is rendered
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('https://github.com/mitkury/markpage/tree/main/packages/tests');
    expect(link?.textContent).toContain('tests directory');
  });

  test('should render multiple links in list items', () => {
    const markdown = `
- **Documentation**: Check out the [main README](https://github.com/mitkury/markpage/blob/main/README.md)
- **Examples**: See [getting started guide](https://github.com/mitkury/markpage/blob/main/docs/getting-started.md)
- **Test Suite**: Comprehensive examples in the [tests directory](https://github.com/mitkury/markpage/tree/main/packages/tests)
`;

    const { container } = render(Markdown, {
      source: markdown
    });


    // Check that we have 3 list items
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(3);

    // Check that we have 3 links
    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(3);

    // Check specific links
    expect(links[0]?.getAttribute('href')).toBe('https://github.com/mitkury/markpage/blob/main/README.md');
    expect(links[1]?.getAttribute('href')).toBe('https://github.com/mitkury/markpage/blob/main/docs/getting-started.md');
    expect(links[2]?.getAttribute('href')).toBe('https://github.com/mitkury/markpage/tree/main/packages/tests');
  });

  test('should render links with components in list items', () => {
    const markdown = `
- **Test Suite**: Comprehensive examples in the [tests directory](https://github.com/mitkury/markpage/tree/main/packages/tests)
- **Components**: Try the <Button variant="primary">Test Button</Button> component
- **More Info**: See the [documentation](https://github.com/mitkury/markpage) for details
`;

    const options = new MarkpageOptions()
      .addCustomComponent('Button', Button);

    const { container } = render(Markdown, {
      source: markdown,
      options
    });


    // Check that we have 3 list items
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(3);

    // Check that we have 2 links (not 3, because the middle one has a component)
    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(2);

    // Check that we have 1 button
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
  });
});