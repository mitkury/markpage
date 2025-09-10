# Critical Component Parsing Bug

## Issue Summary

**CRITICAL BUG**: Components with content (both registered and unregistered) break all subsequent markdown parsing, causing headers and paragraphs to render as empty elements.

**Self-closing components work correctly**, but **components with content between tags break the parser**.

## Root Cause Analysis

### What Works
- Component extension correctly finds opening and closing tags
- Component extension correctly calculates `endIndex` and `raw` values
- Component extension returns proper tokens
- Components are rendered as fallback components correctly

### What's Broken
- **All content AFTER components with content fails to parse**
- Headers become empty: `<h2></h2>`
- Paragraphs become empty: `<p></p>`
- Markdown syntax (bold, links) is not processed
- **Affects both registered and unregistered components with content**

### Evidence

**Failing markdown:**
```markdown
## Before
Content before.

<Button variant="primary">Primary Button</Button>

## After
Content after should still work.
```

**Working markdown:**
```markdown
## Before
Content before.

<Button variant="primary" text="Primary Button" />

## After
Content after should still work.
```

**Actual HTML output:**
```html
<h2>Before</h2>
<p>Content before.</p>
<div class="component-fallback">&lt;UnknownComponent&gt;...&lt;/UnknownComponent&gt;</div>
<h2></h2>  <!-- EMPTY -->
<p></p>    <!-- EMPTY -->
```

**Debug output shows component extension working correctly:**
```
Component UnknownComponent endIndex: 85 src length: 130
Component UnknownComponent src: <UnknownComponent>
  This content will be displayed as plain text
</UnknownComponent>

## After

Content after should still work.

Component UnknownComponent raw: <UnknownComponent>
  This content will be displayed as plain text
</UnknownComponent>
```

## Technical Analysis

### Component Extension is Working Correctly
1. ✅ `findMatchingClose()` finds closing tags correctly
2. ✅ `raw` value is correctly set to entire component
3. ✅ `endIndex` is calculated correctly
4. ✅ Component tokens are returned properly
5. ✅ Components render as fallback correctly

### The Real Issue
The problem is **NOT** in the component extension itself, but in how **marked.js handles the parsing state after processing component tokens**.

When a component token is returned with a `raw` value, marked.js should continue parsing from the position after the consumed content. Something is going wrong with this process, causing the parser to lose track of the remaining content.

## Impact

This bug affects:
- **Production websites** (confirmed in getting-started.md)
- **All unregistered components with content**
- **All content after the problematic component**

## Current Status

- ✅ Bug reproduced and isolated
- ✅ Root cause identified (marked.js parsing state issue)
- ❌ Fix not yet implemented
- ❌ Workaround not yet available

## Potential Solutions

### Option 1: Fix Component Extension Token Structure
Investigate if the token structure returned by the component extension is compatible with marked.js expectations.

### Option 2: Alternative Component Processing
Process components at a different stage in the markdown pipeline to avoid conflicts with marked.js tokenization.

### Option 3: Marked.js Extension Pattern Review
Review if we're implementing the marked.js extension pattern correctly, particularly around `raw` handling.

### Option 4: Pre/Post Processing
Implement pre-processing to handle components before marked.js, or post-processing to fix the broken parsing state.

## Reproduction Steps

1. Create markdown with unregistered component containing content
2. Render using Markpage
3. Observe that all content after the component fails to parse correctly

## Test Cases

- `renderer/debug-component-parsing.test.ts` - Basic reproduction
- `renderer/debug-html-entities.test.ts` - Multiple test scenarios
- `renderer/unregistered-components-break-parsing.test.ts` - Comprehensive test

## Priority

**CRITICAL** - This breaks production websites and affects core functionality.