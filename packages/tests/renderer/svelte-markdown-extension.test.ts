import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { Markdown, Marked, MarkpageOptions } from '@markpage/svelte';
import MathInline from './components/MathInline.svelte';
import MathBlock from './components/MathBlock.svelte';

// Simple marked extension to detect $...$ (inline) and $$...$$ (block)
function mathExtension() {
  return {
    extensions: [
      {
        name: 'math_block',
        level: 'block' as const,
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
        start(src: string) {
          const i = src.indexOf('$');
          return i < 0 ? undefined : i;
        },
        tokenizer(src: string) {
          if (src.startsWith('$$')) return; // let block handle
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

// Using Svelte components from the test components directory

describe('Svelte Markdown extensionComponents rendering', () => {
  it('renders custom math tokens using legacy extensionComponents', async () => {
    const markedInstance = new Marked();
    markedInstance.use(mathExtension());

    const extensionComponents = new Map<string, any>([
      ['math_inline', MathInline],
      ['math_block', MathBlock]
    ]);

    const source = `
Here is inline math $a+b=c$.

$$
E = mc^2
$$
`;

    const { container } = render(Markdown as any, {
      props: { source, markedInstance, extensionComponents }
    });

    const inline = container.querySelector('span[data-math="inline"]');
    expect(inline).toBeTruthy();
    expect(inline?.textContent).toContain('a+b=c');

    const block = container.querySelector('div[data-math="block"]');
    expect(block).toBeTruthy();
    expect(block?.textContent).toContain('E = mc^2');
  });

  it('renders custom math tokens using new MarkpageOptions API', async () => {
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
              if (src.startsWith('$$')) return; // let block handle
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

    const markedInstance = new Marked();
    markedInstance.use(mathExtension());

    const options = new MarkpageOptions()
      .extendMarkdown(mathExtensionWithComponents())
      .useMarkedInstance(markedInstance);

    const source = `
Here is inline math $a+b=c$.

$$
E = mc^2
$$
`;

    const { container } = render(Markdown as any, {
      props: { source, options }
    });

    const inline = container.querySelector('span[data-math="inline"]');
    expect(inline).toBeTruthy();
    expect(inline?.textContent).toContain('a+b=c');

    const block = container.querySelector('div[data-math="block"]');
    expect(block).toBeTruthy();
    expect(block?.textContent).toContain('E = mc^2');
  });
});

