// Keep types framework-local to avoid cross-package type resolution issues during dev
export type BuiltinTokenName = string;
export type ComponentTokenName = BuiltinTokenName | 'component';
export type ComponentName = ComponentTokenName | (string & {});


