import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown, MarkpageOptions, Marked } from '@markpage/svelte';
import Button from './components/Button.svelte';
import Alert from './components/Alert.svelte';
import MathInline from './components/MathInline.svelte';
import MathBlock from './components/MathBlock.svelte';

describe('MarkpageOptions', () => {
  describe('addCustomComponent', () => {
    it('registers custom components that can be used as tags', async () => {
      const options = new MarkpageOptions()
        .addCustomComponent('Button', Button)
        .addCustomComponent('Alert', Alert);

      const source = `
## Test

<Button variant="primary">Click me</Button>

<Alert variant="info">Info message</Alert>
`;

      const { container } = render(Markdown as any, { 
        props: { source, options } 
      });

      const button = container.querySelector('button[data-variant="primary"]');
      expect(button).toBeTruthy();
      expect(button?.textContent).toContain('Click me');

      const alert = container.querySelector('div[role="alert"][data-variant="info"]');
      expect(alert).toBeTruthy();
      expect(alert?.textContent).toContain('Info message');
    });

    it('supports chaining multiple addCustomComponent calls', async () => {
      const options = new MarkpageOptions()
        .addCustomComponent('Button', Button)
        .addCustomComponent('Alert', Alert);

      const components = options.getComponents();
      expect(components.has('Button')).toBe(true);
      expect(components.has('Alert')).toBe(true);
      expect(components.get('Button')).toBe(Button);
      expect(components.get('Alert')).toBe(Alert);
    });
  });

  describe('extendMarkdown', () => {
    it('registers extension components for custom tokens', async () => {
      function mathExtensionWithComponents() {
        return {
          extensions: [
            {
              name: 'math_block',
              level: 'block' as const,
              component: MathBlock,
              start(src: string) { 
                const i = src.indexOf('$$'); 
                return i < 0 ? undefined : i; 
              },
              tokenizer(src: string) {
                if (!src.startsWith('$$')) return;
                const end = src.indexOf('$$', 2);
                if (end === -1) return;
                const raw = src.slice(0, end + 2);
                const text = src.slice(2, end).trim();
                return { type: 'math_block', raw, text } as any;
              }
            },
            {
              name: 'math_inline',
              level: 'inline' as const,
              component: MathInline,
              start(src: string) { 
                const i = src.indexOf('$'); 
                return i < 0 ? undefined : i; 
              },
              tokenizer(src: string) {
                if (src.startsWith('$$')) return;
                if (!src.startsWith('$')) return;
                const end = src.indexOf('$', 1);
                if (end === -1) return;
                const raw = src.slice(0, end + 1);
                const text = src.slice(1, end).trim();
                return { type: 'math_inline', raw, text } as any;
              }
            }
          ]
        };
      }

      const options = new MarkpageOptions()
        .extendMarkdown(mathExtensionWithComponents());

      const extensionComponents = options.getExtensionComponents();
      expect(extensionComponents.has('math_block')).toBe(true);
      expect(extensionComponents.has('math_inline')).toBe(true);
      expect(extensionComponents.get('math_block')).toBe(MathBlock);
      expect(extensionComponents.get('math_inline')).toBe(MathInline);
    });

    it('supports multiple extension sets', async () => {
      function mathExtension() {
        return {
          extensions: [
            {
              name: 'math_inline',
              level: 'inline' as const,
              component: MathInline,
              start: () => 0,
              tokenizer: () => ({ type: 'math_inline', raw: '', text: '' })
            }
          ]
        };
      }

      function alertExtension() {
        return {
          extensions: [
            {
              name: 'alert',
              level: 'block' as const,
              component: Alert,
              start: () => 0,
              tokenizer: () => ({ type: 'alert', raw: '', text: '' })
            }
          ]
        };
      }

      const options = new MarkpageOptions()
        .extendMarkdown([mathExtension(), alertExtension()]);

      const extensionComponents = options.getExtensionComponents();
      expect(extensionComponents.has('math_inline')).toBe(true);
      expect(extensionComponents.has('alert')).toBe(true);
    });
  });

  describe('useMarkedInstance', () => {
    it('uses the provided Marked instance', async () => {
      const customMarked = new Marked();
      const options = new MarkpageOptions()
        .useMarkedInstance(customMarked);

      const marked = options.getMarked();
      expect(marked).toBe(customMarked);
    });
  });

  describe('useMarkedFactory', () => {
    it('uses the factory to create Marked instances', async () => {
      let factoryCalled = false;
      const factory = () => {
        factoryCalled = true;
        return new Marked();
      };

      const options = new MarkpageOptions()
        .useMarkedFactory(factory);

      const marked = options.getMarked();
      expect(factoryCalled).toBe(true);
      expect(marked).toBeInstanceOf(Marked);
    });
  });

  describe('integration with Markdown component', () => {
    it('works with custom components and extensions together', async () => {
      function mathExtensionWithComponents() {
        return {
          extensions: [
            {
              name: 'math_inline',
              level: 'inline' as const,
              component: MathInline,
              start(src: string) { 
                const i = src.indexOf('$'); 
                return i < 0 ? undefined : i; 
              },
              tokenizer(src: string) {
                if (src.startsWith('$$')) return;
                if (!src.startsWith('$')) return;
                const end = src.indexOf('$', 1);
                if (end === -1) return;
                const raw = src.slice(0, end + 1);
                const text = src.slice(1, end).trim();
                return { type: 'math_inline', raw, text } as any;
              }
            }
          ]
        };
      }

      // Create a Marked instance with the math extension
      const markedInstance = new Marked();
      markedInstance.use(mathExtensionWithComponents());

      const options = new MarkpageOptions()
        .addCustomComponent('Button', Button)
        .extendMarkdown(mathExtensionWithComponents())
        .useMarkedInstance(markedInstance);

      const source = `
<Button variant="primary">Click me</Button>

Here is math: $a+b=c$
`;

      const { container } = render(Markdown as any, { 
        props: { source, options } 
      });

      const button = container.querySelector('button');
      expect(button).toBeTruthy();

      const math = container.querySelector('span[data-math="inline"]');
      expect(math).toBeTruthy();
      expect(math?.textContent).toContain('a+b=c');
    });

    it('options take precedence over legacy props', async () => {
      const options = new MarkpageOptions()
        .addCustomComponent('Button', Button);

      const legacyComponents = new Map([['Button', Alert]]);

      const source = '<Button variant="primary">Click me</Button>';

      const { container } = render(Markdown as any, { 
        props: { source, options, components: legacyComponents } 
      });

      // Should use the component from options, not legacy props
      const button = container.querySelector('button[data-variant="primary"]');
      expect(button).toBeTruthy();
      expect(button?.textContent).toContain('Click me');
    });
  });

  describe('chaining', () => {
    it('supports method chaining', async () => {
      const options = new MarkpageOptions()
        .addCustomComponent('Button', Button)
        .addCustomComponent('Alert', Alert)
        .useMarkedInstance(new Marked());

      expect(options.getComponents().has('Button')).toBe(true);
      expect(options.getComponents().has('Alert')).toBe(true);
      expect(options.getMarked()).toBeInstanceOf(Marked);
    });
  });
});