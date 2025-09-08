export const builtinTokenNames = [
  'blockquote',
  'heading',
  'list',
  'list_item',
  'br',
  'code',
  'codespan',
  'table',
  'html',
  'paragraph',
  'link',
  'text',
  'def',
  'del',
  'em',
  'hr',
  'strong',
  'image',
  'space',
] as const;

export type BuiltinTokenName = typeof builtinTokenNames[number];

// Includes custom component token emitted by the extension
export type ComponentTokenName = BuiltinTokenName | 'component';


