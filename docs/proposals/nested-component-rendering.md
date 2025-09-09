# Nested Component Rendering Fix

## Problem Statement

Currently, custom components work perfectly when used standalone, but fail when nested inside other markdown elements (lists, paragraphs, other components). The issue manifests as:

- Components render as empty elements with incorrect attributes
- Component content appears as separate text nodes instead of being passed to the component
- Nested scenarios like `<Button>Click me</Button>` inside list items don't work

## Root Cause Analysis

The issue is in the component tokenizer in `/packages/markpage/src/extensions/component.ts`. When parsing component children, it uses a plain `Lexer` that doesn't have the component extension applied:

```typescript
// Line 80 in component.ts - THE PROBLEM
const lexer = new Lexer();
const children = lexer.inlineTokens(inner);
```

This means that when a component contains other components (like `<Alert><Button>Click me</Button></Alert>`), the inner `<Button>` is never tokenized as a component - it's just treated as regular text.

## The Simple Solution

The existing architecture already supports everything we need:

1. **Inline tokens work**: `MarkdownText.svelte` shows that tokens can contain other tokens (`token.tokens`)
2. **Component children work**: `MarkdownComponentTag.svelte` already renders `token.children` using `MarkdownTokens`
3. **The only missing piece**: The tokenizer needs to apply the component extension when parsing children

### The Fix

Replace the plain `Lexer` with a `Marked` instance that has the component extension applied:

```typescript
// Instead of:
const lexer = new Lexer();
const children = lexer.inlineTokens(inner);

// Use:
const tempMarked = new Marked();
tempMarked.use({ extensions: [componentExtension] });
const children = tempMarked.lexer(inner);
```

This single change will enable nested components because:

- ✅ **Leverages existing architecture**: Uses the same pattern as other inline tokens
- ✅ **Minimal change**: Only one line needs to be modified
- ✅ **No new extensions needed**: Reuses the existing component extension
- ✅ **Backward compatible**: Doesn't break anything existing
- ✅ **Recursive support**: Components can be nested multiple levels deep

## Implementation

### Single File Change

The fix requires modifying only one file: `/packages/markpage/src/extensions/component.ts`

**Current code (line 79-80):**
```typescript
const lexer = new Lexer();
const children = lexer.inlineTokens(inner);
```

**New code:**
```typescript
const tempMarked = new Marked();
tempMarked.use({ extensions: [componentExtension] });
const children = tempMarked.lexer(inner);
```

### Why This Works

1. **Inline tokens are already supported**: The rendering system already handles `token.tokens` arrays
2. **Component children are already supported**: `MarkdownComponentTag` already renders `token.children`
3. **The only missing piece**: The tokenizer needs to apply the component extension when parsing children

This approach is much simpler than creating dual-level extensions because the existing architecture already supports everything we need - we just need to fix the tokenizer to properly parse nested components.

## Expected Outcomes

After implementing this solution:

1. **Nested Components Work**: `<Button>Click me</Button>` inside list items will render correctly
2. **Deep Nesting Support**: Components can be nested multiple levels deep
3. **Backward Compatibility**: Existing standalone components continue to work
4. **Performance**: Minimal impact on parsing performance
5. **Maintainability**: Simple, single-line fix that leverages existing architecture

## Testing Strategy

### Test Cases to Implement

1. **Basic Nested Components**:
   ```markdown
   - List item with <Button>Click me</Button>
   ```

2. **Deep Nesting**:
   ```markdown
   <Alert variant="warning">
     This alert contains <Button variant="primary">Nested Button</Button>
   </Alert>
   ```

3. **Multiple Nested Components**:
   ```markdown
   <Card title="Test">
     <Button>Button 1</Button>
     <Alert>Alert with <Button>Button 2</Button></Alert>
   </Card>
   ```

4. **Mixed Content**:
   ```markdown
   - Regular text with **bold** and <Button>component</Button>
   ```

5. **Edge Cases**:
   - Self-closing components in nested contexts
   - Components with complex props in nested contexts
   - Very deep nesting (performance test)

## Conclusion

This simple solution addresses the core issue of nested component rendering with a minimal, single-line change. The fix leverages the existing architecture that already supports inline tokens and component children, requiring only that the tokenizer properly applies the component extension when parsing nested content.

The solution is backward-compatible, maintainable, and provides robust nested component support without the complexity of dual-level extensions.
