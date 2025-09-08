// Server-only helpers can live here. No Svelte components or browser-only code.
// Keep it minimal and opt-in so browser bundles never import this.

export async function readFile(path: string): Promise<string> {
  const { readFileSync } = await import('node:fs');
  return readFileSync(path, 'utf8');
}


