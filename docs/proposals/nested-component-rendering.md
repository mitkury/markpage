# Nested Component Rendering Fix

## Problem Statement

Currently, custom components work perfectly when used standalone, but fail when nested inside other markdown elements (lists, paragraphs, other components). The issue manifests as:

- Components render as empty elements with incorrect attributes
- Component content appears as separate text nodes instead of being passed to the component
- Nested scenarios like `<Button>Click me</Button>` inside list items don't work

## Root Cause Analysis

### Current Architecture

The component system uses a single `componentExtension` that is registered as `level: 'block'` in `/packages/markpage/src/extensions/component.ts`. This means:

1. **Block-level only**: Components are only processed at the document block level
2. **No inline processing**: When components appear inside list items, paragraphs, or other elements, they're treated as regular text
3. **No recursive parsing**: Component children aren't recursively processed for nested components

### Specific Issues

1. **Tokenizer Level Mismatch**: 
   ```typescript
   // Current: Only block level
   level: 'block'
   ```
   This means `<Button>Click me</Button>` inside `- List item with <Button>Click me</Button>` is never tokenized as a component.

2. **Content Parsing Limitation**:
   ```typescript
   // Line 80 in component.ts
   const children = lexer.inlineTokens(inner);
   ```
   This doesn't apply the component extension to nested content.

3. **Single Extension Registration**:
   ```typescript
   // newMarked() only registers block-level extension
   md.use({ extensions: [componentExtension as any] as any } as any);
   ```

## Proposed Solution

### 1. Dual-Level Component Extensions

Create both block and inline versions of the component extension:

```typescript
// Block-level component extension (existing)
export const componentBlockExtension: TokenizerAndRendererExtension = {
  name: 'component-block',
  level: 'block',
  // ... existing logic
};

// New: Inline-level component extension
export const componentInlineExtension: TokenizerAndRendererExtension = {
  name: 'component-inline', 
  level: 'inline',
  start(src: string) {
    const i = src.search(/<[A-Z]/);
    return i < 0 ? undefined : i;
  },
  tokenizer(src: string) {
    // Same logic as block extension but for inline context
    // ... tokenizer implementation
  }
};
```

### 2. Enhanced Component Tokenizer

Modify the component tokenizer to handle nested components properly:

```typescript
function parseComponentChildren(inner: string, lexer: Lexer): any[] {
  // Create a temporary marked instance with component extensions
  const tempMarked = new Marked();
  tempMarked.use({ extensions: [componentBlockExtension, componentInlineExtension] });
  
  // Parse with component support
  return tempMarked.lexer(inner);
}
```

### 3. Updated Extension Registration

Modify `newMarked()` to register both extensions:

```typescript
export function newMarked() {
  const md = new Marked();
  md.use({ 
    extensions: [
      componentBlockExtension as any,
      componentInlineExtension as any
    ] as any 
  } as any);
  return md;
}
```

### 4. Recursive Component Processing

Ensure that when parsing component children, the component extensions are applied:

```typescript
// In component tokenizer
if (m) {
  const openRaw = m[0];
  const name = m[1] as string;
  const attrs = m[2] ?? '';
  const innerStart = openRaw.length;
  const endIndex = findMatchingClose(src, name, innerStart);
  if (endIndex > -1) {
    const raw = src.slice(0, endIndex);
    const inner = src.slice(innerStart, endIndex - (`</${name}>`.length));
    
    // Use enhanced parsing that supports nested components
    const children = parseComponentChildren(inner, lexer);
    return { type: 'component', raw, name, props: parseProps(attrs), children } as any;
  }
}
```

## Implementation Plan

### Phase 1: Create Inline Component Extension
- [ ] Create `componentInlineExtension` in `/packages/markpage/src/extensions/component.ts`
- [ ] Implement inline-level tokenizer logic
- [ ] Add proper start function for inline context

### Phase 2: Enhance Content Parsing
- [ ] Create `parseComponentChildren()` function
- [ ] Modify component tokenizer to use enhanced parsing
- [ ] Ensure recursive component processing

### Phase 3: Update Extension Registration
- [ ] Modify `newMarked()` to register both extensions
- [ ] Update `MarkpageOptions` to handle dual extensions
- [ ] Ensure backward compatibility

### Phase 4: Testing and Validation
- [ ] Create comprehensive tests for nested scenarios
- [ ] Test components in lists, paragraphs, and other components
- [ ] Verify existing functionality still works
- [ ] Performance testing for deeply nested components

## Alternative Approaches Considered

### Option A: Single Extension with Dynamic Level
- **Pros**: Simpler architecture
- **Cons**: Marked.js doesn't support dynamic level switching, would require complex workarounds

### Option B: Preprocessing Approach
- **Pros**: Could work with existing architecture
- **Cons**: Would break markdown parsing order, complex to implement correctly

### Option C: Custom Tokenizer Integration
- **Pros**: Full control over parsing
- **Cons**: Would require rewriting significant portions of the markdown pipeline

## Expected Outcomes

After implementing this solution:

1. **Nested Components Work**: `<Button>Click me</Button>` inside list items will render correctly
2. **Deep Nesting Support**: Components can be nested multiple levels deep
3. **Backward Compatibility**: Existing standalone components continue to work
4. **Performance**: Minimal impact on parsing performance
5. **Maintainability**: Clean separation between block and inline processing

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

## Risks and Mitigation

### Risk 1: Performance Impact
- **Mitigation**: Benchmark parsing performance, optimize if needed

### Risk 2: Breaking Changes
- **Mitigation**: Comprehensive testing, gradual rollout

### Risk 3: Complex Edge Cases
- **Mitigation**: Extensive test coverage, careful implementation

## Conclusion

This proposal addresses the core issue of nested component rendering by implementing dual-level component extensions. The solution is backward-compatible, maintainable, and provides the foundation for robust nested component support.

The implementation can be done incrementally, with each phase building on the previous one, allowing for testing and validation at each step.
