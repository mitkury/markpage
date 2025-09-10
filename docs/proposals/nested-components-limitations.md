# Nested Components Limitations

## Overview

This document describes the current limitations with nested custom components in the Markpage Svelte renderer. While basic nested components work correctly, there are specific scenarios where complex nesting fails.

## Current Status

- ✅ **Working**: Components inside inline tokens (lists, paragraphs, blockquotes)
- ✅ **Working**: Basic nested components (simple one-level nesting)
- ❌ **Failing**: Complex multi-level nested components

## Failing Test Cases

### 1. Custom Components Inside Other Custom Components

**Test**: `should render custom components inside other custom components`

**Markdown**:
```markdown
<Card title="Nested Test" subtitle="Testing components within components">
  This card contains:
  
  <Button variant="primary">Button in Card</Button>
  
  <Alert variant="success">
    This alert is inside a card component!
    
    And it has another button: <Button variant="secondary">Nested Button</Button>
  </Alert>
</Card>
```

**Expected**: Card component with Button and Alert components inside, Alert containing another Button
**Actual**: Card renders correctly, first Button renders correctly, but Alert renders as raw HTML `<alert>` element

### 2. Deep Nesting of Custom Components

**Test**: `should handle deep nesting of custom components`

**Markdown**:
```markdown
<Alert variant="warning">
  This is a warning alert that contains:
  
  <Card title="Card in Alert" subtitle="Nested card component">
    This card is inside an alert!
    
    <Button variant="danger">Danger Button</Button>
  </Card>
</Alert>
```

**Expected**: Alert component containing Card component containing Button component
**Actual**: Alert renders as raw HTML `<alert>` element, Card not found

### 3. Mixed Content in Lists with Custom Components

**Test**: `should render mixed content in lists with custom components`

**Markdown**:
```markdown
- Regular list item
- List item with <Button variant="primary">Button</Button>
- List item with <Alert variant="success">Success Button</Alert>
- List item with <Button variant="secondary">Secondary Button</Button>
```

**Expected**: 4 buttons total (1 in list item, 1 in alert, 2 standalone)
**Actual**: Only 3 buttons found (alert renders as raw HTML)

### 4. Self-Closing Components in Nested Contexts

**Test**: `should handle self-closing components in nested contexts`

**Markdown**:
```markdown
<Card title="Self-Closing Test">
  <Button variant="primary">Regular Button</Button>
  <Button variant="secondary" />
  <Alert variant="info" />
</Card>
```

**Expected**: Card with 2 buttons and 1 alert
**Actual**: Only 1 button renders, others render as raw HTML

### 5. Component Props in Nested Contexts

**Test**: `should preserve component props in nested contexts`

**Markdown**:
```markdown
<Card title="Props Test">
  <Alert variant="warning" data-test="nested-alert">
    Alert with custom props
    <Button variant="primary" data-test="nested-button">Button</Button>
  </Alert>
</Card>
```

**Expected**: Alert with `data-test="nested-alert"` attribute
**Actual**: Alert renders as raw HTML without attributes

## Root Cause Analysis

### The Problem

The issue occurs when components are nested inside other components. The component extension correctly parses the outer component (like `<Card>`), but fails to process the inner components (like `<Alert>` inside the Card).

### Technical Details

1. **Component Extension Processing**: The block-level component extension processes the outer component correctly
2. **Nested Content Parsing**: When parsing the inner content of a component, the extension uses `markedInstance.lexer(inner)` to parse nested content
3. **Token Extraction**: The parsed nested tokens are processed, but inner components are not being recognized as component tokens
4. **Raw HTML Rendering**: Instead of being processed as component tokens, inner components are rendered as raw HTML elements

### Why This Happens

The component extension's nested content parsing logic has a limitation:

```typescript
// Current logic in component extension
const nestedTokens = markedInstance.lexer(inner);
if (nestedTokens.length > 0) {
  children = [];
  for (const token of nestedTokens) {
    if (token.type === 'paragraph' && (token as any).tokens) {
      // Extract tokens from paragraph
      children.push(...(token as any).tokens);
    } else if (token.type === 'component') {
      // Direct component token
      children.push(token);
    } else {
      // Other token types
      children.push(token);
    }
  }
}
```

The issue is that when components are nested inside other components, they may not be recognized as `component` tokens by the lexer, or they may be wrapped in paragraph tokens that don't contain the component tokens correctly.

## Potential Solutions

### 1. Recursive Component Processing

Modify the component extension to recursively process nested content, ensuring that any component tags found in the inner content are properly tokenized.

### 2. Improved Token Extraction

Enhance the token extraction logic to better handle cases where components are nested within paragraph tokens or other block-level tokens.

### 3. Pre-processing Approach

Implement a pre-processing step that identifies all component tags in the markdown before parsing, ensuring they're all properly recognized.

### 4. Custom Lexer Integration

Create a custom lexer that specifically handles component nesting scenarios.

## Impact

These limitations affect:
- Complex component compositions
- Multi-level component nesting
- Components with rich content (containing other components)
- Self-closing components in nested contexts

## Workarounds

For now, users can:
1. Use components in simple contexts (lists, paragraphs, basic nesting)
2. Avoid deeply nested component structures
3. Use HTML elements for complex layouts instead of nested components

## Future Work

This limitation should be addressed in a future iteration to support full component nesting capabilities.