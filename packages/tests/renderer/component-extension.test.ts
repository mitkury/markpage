import { describe, it, expect } from 'vitest';
import { Marked } from 'marked';
import { componentExtension } from 'markpage/renderer';

describe('componentExtension', () => {
  function withExtension() {
    const md = new Marked();
    md.use({ extensions: [componentExtension] });
    return md;
  }

  it('tokenizes self-closing component with props', () => {
    const md = withExtension();
    const src = 'Hello <Button variant="primary" count={1} disabled /> world';
    const tokens = md.lexer(src);

    // Find our component token among inline tokens merged into top-level paragraph
    const para = tokens.find((t: any) => t.type === 'paragraph') as any;
    expect(para).toBeTruthy();
    const inline = para.tokens as any[];
    const comp = inline.find((t: any) => t.type === 'component');

    expect(comp).toBeTruthy();
    expect(comp.name).toBe('Button');
    expect(comp.props).toMatchObject({ variant: 'primary', count: 1, disabled: true });
    expect(comp.children).toBeUndefined();
  });

  it('tokenizes paired component with markdown children', () => {
    const md = withExtension();
    const src = '<Alert variant="warning">This is **important** notice</Alert>';
    const tokens = md.lexer(src);

    const para = tokens.find((t: any) => t.type === 'paragraph') as any;
    expect(para).toBeTruthy();
    const comp = (para.tokens as any[]).find((t: any) => t.type === 'component') as any;

    expect(comp).toBeTruthy();
    expect(comp.name).toBe('Alert');
    expect(comp.props).toMatchObject({ variant: 'warning' });
    expect(Array.isArray(comp.children)).toBe(true);
    // Ensure children include a strong token from **important**
    const hasStrong = (comp.children as any[]).some((t: any) => t.type === 'strong');
    expect(hasStrong).toBe(true);
  });

  it('does not intercept lowercase html tags', () => {
    const md = withExtension();
    const src = '<div>ok</div>';
    const tokens = md.lexer(src);

    // Should be parsed as html (block or inline depending on context), but no component tokens
    const hasComponent = JSON.stringify(tokens).includes('"type":"component"');
    expect(hasComponent).toBe(false);
  });
});


