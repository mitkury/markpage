# Nested Component Rendering Fix

## Problem Statement

Custom components work perfectly when used standalone, but fail when nested inside other markdown elements (lists, paragraphs, other components). The issue manifests as:

- Components render as empty elements with incorrect attributes
- Component content appears as separate text nodes instead of being passed to the component
- Nested scenarios like `<Button>Click me</Button>` inside list items don't work

## Current Status

✅ **FIXED**: Basic nested components in list items now work
✅ **FIXED**: Components inside paragraphs and blockquotes work
✅ **FIXED**: Component tokenization and registration works
❌ **STILL BROKEN**: Components within other components (e.g., `<Card><Alert>...</Alert></Card>`)

## Root Cause Analysis

We identified and fixed the primary issue: **components were not being passed through the rendering pipeline**. The `MarkdownList.svelte` component was not passing the `components` prop to its child `MarkdownToken` components.

However, there's still a secondary issue: **nested component tokenization**. When a component contains other components (like `<Alert><Button>Click me</Button></Alert>`), the inner `<Button>` is not being tokenized as a component - it's being treated as regular text.

The issue is in the component tokenizer in `/packages/markpage/src/extensions/component.ts`. When parsing component children, it uses a plain `Lexer` that doesn't have the component extension applied:

```typescript
// Line 80 in component.ts - THE REMAINING PROBLEM
const lexer = new Lexer();
const children = lexer.inlineTokens(inner);
```

## What We've Already Fixed

### ✅ Primary Issue: Component Prop Passing
We fixed the main issue where components were not being passed through the rendering pipeline:

1. **Fixed `MarkdownList.svelte`**: Now properly passes `components`, `extensionComponents`, and `unknownToken` props to child `MarkdownToken` components
2. **Fixed `MarkpageOptions.getMarked()`**: Now always returns a Marked instance instead of undefined
3. **Fixed component extension level**: Changed from `block` to `inline` to work in nested contexts
4. **Fixed `MarkdownComponentTag`**: Now passes children as Svelte children instead of tokens

### ✅ Results
- Basic nested components in list items: `<Button>Click me</Button>` ✅
- Components inside paragraphs and blockquotes ✅
- Component registration and lookup ✅
- 72 out of 78 tests now pass ✅

## Remaining Issue: Nested Component Tokenization

The remaining problem is that when a component contains other components, the inner components are not being tokenized correctly. For example:

```markdown
<Card>
  <Alert>Content with <Button>Click me</Button></Alert>
</Card>
```

The `<Button>` inside the `<Alert>` is not being tokenized as a component - it's treated as plain text.

## The Simple Solution for Remaining Issue

The fix is straightforward: **use a Marked instance with the component extension when parsing component children**.

### The Fix

Replace the plain `Lexer` with a `Marked` instance that has the component extension:

```typescript
// In component.ts tokenizer (around line 80):
// Instead of:
const lexer = new Lexer();
const children = lexer.inlineTokens(inner);

// Use:
const tempMarked = new Marked();
tempMarked.use({ extensions: [componentExtension] });
const children = tempMarked.lexer(inner);
```

### Why This Works

1. **Leverages existing architecture**: The rendering system already handles `token.children` arrays
2. **Minimal change**: Only 3 lines of code need to be modified
3. **No new extensions needed**: Reuses the existing component extension
4. **Backward compatible**: Doesn't break anything existing
5. **Recursive support**: Components can be nested multiple levels deep

## Implementation

### Step-by-Step Fix

The fix requires modifying only one file: `/packages/markpage/src/extensions/component.ts`

**Current code (around line 80):**
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

### Why This Simple Approach Works

1. **Leverages existing architecture**: The rendering system already handles `token.children` arrays
2. **Minimal change**: Only 3 lines of code need to be modified
3. **No new extensions needed**: Reuses the existing component extension
4. **Backward compatible**: Doesn't break anything existing
5. **Recursive support**: Components can be nested multiple levels deep

### Performance Note

This approach creates a new Marked instance for each nested component parse. While not the most efficient, it's:
- ✅ **Simple and reliable**: No complex caching or context passing
- ✅ **Easy to understand**: Clear what's happening
- ✅ **Easy to debug**: No shared state to worry about
- ✅ **Sufficient for most use cases**: The performance impact is minimal for typical usage

If performance becomes an issue later, we can optimize with a cached instance, but this simple approach should work well for now.

## Expected Outcomes

After implementing this final fix:

1. **All Nested Components Work**: `<Button>Click me</Button>` inside list items, paragraphs, and other components ✅
2. **Deep Nesting Support**: Components can be nested multiple levels deep ✅
3. **Backward Compatibility**: Existing standalone components continue to work ✅
4. **Performance**: Minimal impact on parsing performance ✅
5. **Maintainability**: Simple, 3-line fix that leverages existing architecture ✅

## Current Test Status

### ✅ Already Working (72/78 tests pass)
- Basic nested components in list items
- Components inside paragraphs and blockquotes
- Component registration and lookup
- All core markdown functionality

### ❌ Still Failing (6/78 tests)
- Components within other components (e.g., `<Card><Alert>...</Alert></Card>`)
- Deep nesting scenarios
- Self-closing components in nested contexts
- Complex mixed content scenarios

## Next Steps

1. **Implement the fix**: Replace `Lexer` with `Marked` instance in component tokenizer
2. **Test the fix**: Run the full test suite to verify all 78 tests pass
3. **Clean up**: Remove any debugging code and commit the final solution

## Conclusion

We've made significant progress on nested component rendering:

- ✅ **Fixed the primary issue**: Component prop passing through the rendering pipeline
- ✅ **72 out of 78 tests now pass**: Basic nested components work perfectly
- 🔄 **One simple fix remaining**: Use Marked instance instead of Lexer for component children

The remaining fix is straightforward and will complete the nested component rendering functionality. The solution is simple, reliable, and leverages the existing architecture without breaking changes.
