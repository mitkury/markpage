import { newMarked } from './packages/markpage-svelte/src/lib/index.js';

const md = newMarked();
const source = `- List item with <Button variant="primary">Click me</Button>`;

console.log('Source:', source);
const tokens = md.lexer(source);
console.log('Tokens:', JSON.stringify(tokens, null, 2));