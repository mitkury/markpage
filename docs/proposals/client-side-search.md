# Client-Side Search for Static Websites

A comprehensive guide for implementing search functionality in markpage websites using client-side JavaScript solutions that work entirely in the browser.

## Overview

This guide focuses on search solutions that:
- ✅ Work entirely in the browser (no server required)
- ✅ Are open source and free
- ✅ Can be embedded in static websites
- ✅ Don't require external services or APIs
- ✅ Index content at build time

## Search Solutions

### 1. **Lunr.js** (Most Popular)

**Best for**: Small to medium documentation sites
**Bundle Size**: ~40KB gzipped
**Performance**: Excellent for < 1000 documents

#### Installation
```bash
npm install lunr
```

#### Basic Implementation
```typescript
// src/lib/search.ts
import lunr from 'lunr';

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  section?: string;
  tags?: string[];
}

export class LunrSearch {
  private index: lunr.Index;
  private documents: SearchDocument[];

  constructor(documents: SearchDocument[]) {
    this.documents = documents;
    this.index = lunr(function() {
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('content', { boost: 5 });
      this.field('section', { boost: 3 });
      this.field('tags', { boost: 2 });

      documents.forEach(doc => {
        this.add(doc);
      });
    });
  }

  search(query: string, limit = 10): SearchDocument[] {
    if (!query.trim()) return [];
    
    const results = this.index.search(query);
    return results
      .slice(0, limit)
      .map(result => this.documents.find(doc => doc.id === result.ref)!)
      .filter(Boolean);
  }

  getDocument(id: string): SearchDocument | undefined {
    return this.documents.find(doc => doc.id === id);
  }
}
```

#### Svelte Component
```svelte
<!-- src/lib/components/LunrSearch.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { LunrSearch, type SearchDocument } from '$lib/search';
  
  export let documents: SearchDocument[] = [];
  export let placeholder = 'Search documentation...';
  export let maxResults = 10;
  
  let searchQuery = '';
  let searchResults: SearchDocument[] = [];
  let searchInstance: LunrSearch;
  let isSearching = false;
  let showResults = false;
  
  const dispatch = createEventDispatcher();
  
  // Initialize search index
  $: {
    if (documents.length > 0 && !searchInstance) {
      searchInstance = new LunrSearch(documents);
    }
  }
  
  // Perform search with debouncing
  let searchTimeout: number;
  $: {
    if (searchInstance && searchQuery.trim()) {
      clearTimeout(searchTimeout);
      isSearching = true;
      showResults = true;
      
      searchTimeout = setTimeout(() => {
        searchResults = searchInstance.search(searchQuery, maxResults);
        isSearching = false;
      }, 300);
    } else {
      searchResults = [];
      showResults = false;
    }
  }
  
  function handleResultClick(result: SearchDocument) {
    dispatch('resultClick', result);
    showResults = false;
    searchQuery = '';
  }
  
  function handleInputFocus() {
    if (searchResults.length > 0) {
      showResults = true;
    }
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      showResults = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="search-container">
  <div class="search-input-wrapper">
    <input
      type="text"
      bind:value={searchQuery}
      {placeholder}
      on:focus={handleInputFocus}
      class="search-input"
      aria-label="Search documentation"
    />
    {#if isSearching}
      <div class="search-spinner">🔍</div>
    {/if}
  </div>
  
  {#if showResults && searchResults.length > 0}
    <div class="search-results" role="listbox">
      {#each searchResults as result (result.id)}
        <div 
          class="search-result"
          on:click={() => handleResultClick(result)}
          role="option"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && handleResultClick(result)}
        >
          <div class="result-header">
            <h4 class="result-title">{result.title}</h4>
            {#if result.section}
              <span class="result-section">{result.section}</span>
            {/if}
          </div>
          <p class="result-excerpt">
            {result.content.substring(0, 150)}
            {result.content.length > 150 ? '...' : ''}
          </p>
          {#if result.tags && result.tags.length > 0}
            <div class="result-tags">
              {#each result.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else if showResults && searchQuery.trim() && !isSearching}
    <div class="no-results">
      <p>No results found for "{searchQuery}"</p>
      <p class="no-results-suggestions">
        Try different keywords or check your spelling
      </p>
    </div>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .search-input-wrapper {
    position: relative;
  }
  
  .search-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.2s;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  .search-spinner {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: translateY(-50%) rotate(0deg); }
    to { transform: translateY(-50%) rotate(360deg); }
  }
  
  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-height: 500px;
    overflow-y: auto;
    z-index: 1000;
    margin-top: 4px;
  }
  
  .search-result {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .search-result:hover,
  .search-result:focus {
    background: #f8fafc;
    outline: none;
  }
  
  .search-result:last-child {
    border-bottom: none;
  }
  
  .result-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .result-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
  }
  
  .result-section {
    font-size: 12px;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 12px;
    white-space: nowrap;
  }
  
  .result-excerpt {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #475569;
    line-height: 1.5;
  }
  
  .result-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .tag {
    font-size: 11px;
    color: #3b82f6;
    background: #eff6ff;
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .no-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    margin-top: 4px;
    z-index: 1000;
  }
  
  .no-results p {
    margin: 0 0 8px 0;
    color: #64748b;
  }
  
  .no-results-suggestions {
    font-size: 14px;
    color: #94a3b8;
  }
</style>
```

### 2. **FlexSearch** (Fastest)

**Best for**: Large datasets, performance-critical applications
**Bundle Size**: ~15KB gzipped
**Performance**: Excellent for > 1000 documents

#### Installation
```bash
npm install flexsearch
```

#### Implementation
```typescript
// src/lib/flexsearch.ts
import FlexSearch from 'flexsearch';

export class FlexSearchEngine {
  private index: FlexSearch.Index;
  private documents: SearchDocument[];

  constructor(documents: SearchDocument[]) {
    this.documents = documents;
    this.index = new FlexSearch.Index({
      tokenize: 'forward',
      resolution: 9,
      cache: true
    });

    // Index documents
    documents.forEach((doc, id) => {
      this.index.add(id, `${doc.title} ${doc.content} ${doc.section || ''}`);
    });
  }

  async search(query: string, limit = 10): Promise<SearchDocument[]> {
    if (!query.trim()) return [];
    
    const results = await this.index.search(query, {
      limit,
      suggest: true
    });
    
    return results.map(id => this.documents[id as number]);
  }
}
```

### 3. **MiniSearch** (Lightweight)

**Best for**: Small sites, minimal bundle size
**Bundle Size**: ~20KB gzipped
**Performance**: Good for < 500 documents

#### Installation
```bash
npm install minisearch
```

#### Implementation
```typescript
// src/lib/minisearch.ts
import MiniSearch from 'minisearch';

export class MiniSearchEngine {
  private search: MiniSearch;

  constructor(documents: SearchDocument[]) {
    this.search = new MiniSearch({
      fields: ['title', 'content', 'section', 'tags'],
      storeFields: ['id', 'url'],
      searchOptions: {
        boost: { title: 10, section: 3, tags: 2 },
        fuzzy: 0.2,
        prefix: true
      }
    });

    this.search.addAll(documents);
  }

  search(query: string, limit = 10): SearchDocument[] {
    if (!query.trim()) return [];
    
    return this.search.search(query, {
      limit,
      fuzzy: 0.2
    });
  }
}
```

### 4. **Fuse.js** (Fuzzy Search)

**Best for**: Fuzzy matching, typo tolerance
**Bundle Size**: ~25KB gzipped
**Performance**: Good for < 1000 documents

#### Installation
```bash
npm install fuse.js
```

#### Implementation
```typescript
// src/lib/fuse-search.ts
import Fuse from 'fuse.js';

export class FuseSearch {
  private fuse: Fuse<SearchDocument>;

  constructor(documents: SearchDocument[]) {
    this.fuse = new Fuse(documents, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'content', weight: 0.3 },
        { name: 'section', weight: 0.5 }
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2
    });
  }

  search(query: string, limit = 10): SearchDocument[] {
    if (!query.trim()) return [];
    
    return this.fuse.search(query, { limit })
      .map(result => result.item);
  }
}
```

## Content Indexing with markpage

### Build-Time Index Generation

```typescript
// scripts/build-search-index.ts
import { buildPages } from 'markpage/builder';
import { writeFileSync } from 'fs';
import { join } from 'path';

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  section?: string;
  tags?: string[];
  lastModified?: string;
}

function extractTitle(content: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

function extractTags(content: string): string[] {
  const tagMatch = content.match(/^tags?:\s*(.+)$/mi);
  if (tagMatch) {
    return tagMatch[1].split(',').map(tag => tag.trim());
  }
  return [];
}

function cleanContent(content: string): string {
  return content
    .replace(/^#+\s+/gm, '') // Remove headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim();
}

export async function buildSearchIndex(contentPath: string): Promise<SearchDocument[]> {
  const result = await buildPages(contentPath, {
    includeContent: true
  });
  
  const documents: SearchDocument[] = [];
  
  function processItems(items: any[], parentPath = '') {
    for (const item of items) {
      if (item.type === 'page' && item.path) {
        const content = result.content?.[item.path];
        if (content) {
          const title = extractTitle(content);
          const tags = extractTags(content);
          const cleanContent = cleanContent(content);
          
          documents.push({
            id: item.path,
            title,
            content: cleanContent,
            url: `/${item.path.replace(/\.md$/, '')}`,
            section: parentPath || undefined,
            tags: tags.length > 0 ? tags : undefined,
            lastModified: new Date().toISOString()
          });
        }
      } else if (item.items) {
        const sectionPath = parentPath ? `${parentPath} > ${item.label}` : item.label;
        processItems(item.items, sectionPath);
      }
    }
  }
  
  processItems(result.navigation.items);
  return documents;
}

// Build script
async function main() {
  const documents = await buildSearchIndex('./docs');
  
  // Write search index
  writeFileSync(
    join(process.cwd(), 'src/lib/search-index.json'),
    JSON.stringify(documents, null, 2)
  );
  
  console.log(`✅ Generated search index with ${documents.length} documents`);
}

main().catch(console.error);
```

### Package.json Integration

```json
{
  "scripts": {
    "build:search": "node scripts/build-search-index.js",
    "build": "npm run build:docs && npm run build:search"
  }
}
```

## SvelteKit Integration

### Layout Integration

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import Search from '$lib/components/LunrSearch.svelte';
  import searchIndex from '$lib/search-index.json';
  import { goto } from '$app/navigation';
  
  function handleSearchResult(event: CustomEvent) {
    const result = event.detail;
    goto(result.url);
  }
</script>

<header>
  <Search 
    documents={searchIndex} 
    on:resultClick={handleSearchResult}
  />
</header>

<main>
  <slot />
</main>
```

### Search Page

```svelte
<!-- src/routes/search/+page.svelte -->
<script lang="ts">
  import Search from '$lib/components/LunrSearch.svelte';
  import searchIndex from '$lib/search-index.json';
  import { goto } from '$app/navigation';
  
  function handleSearchResult(event: CustomEvent) {
    const result = event.detail;
    goto(result.url);
  }
</script>

<svelte:head>
  <title>Search Documentation</title>
</svelte:head>

<div class="search-page">
  <h1>Search Documentation</h1>
  <p>Find what you're looking for in our documentation.</p>
  
  <Search 
    documents={searchIndex} 
    on:resultClick={handleSearchResult}
    maxResults={20}
  />
  
  <div class="search-stats">
    <p>Searching through {searchIndex.length} documents</p>
  </div>
</div>

<style>
  .search-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .search-stats {
    margin-top: 2rem;
    text-align: center;
    color: #64748b;
  }
</style>
```

## Performance Optimization

### 1. **Lazy Loading**

```typescript
// Lazy load search index
export async function loadSearchIndex() {
  if (typeof window !== 'undefined') {
    const { default: searchIndex } = await import('$lib/search-index.json');
    return searchIndex;
  }
  return [];
}
```

### 2. **Search Index Compression**

```typescript
// Compress search index for smaller bundle
function compressSearchIndex(documents: SearchDocument[]) {
  return documents.map(doc => ({
    i: doc.id,
    t: doc.title,
    c: doc.content.substring(0, 500), // Limit content length
    u: doc.url,
    s: doc.section
  }));
}
```

### 3. **Caching**

```typescript
// Cache search results
const searchCache = new Map<string, SearchDocument[]>();

function cachedSearch(query: string, searchFn: (q: string) => SearchDocument[]) {
  if (searchCache.has(query)) {
    return searchCache.get(query)!;
  }
  
  const results = searchFn(query);
  searchCache.set(query, results);
  return results;
}
```

## Comparison Table

| Solution | Bundle Size | Performance | Features | Best For |
|----------|-------------|-------------|----------|----------|
| **Lunr.js** | ~40KB | ⭐⭐⭐⭐ | Full-text, fuzzy, boosting | General use |
| **FlexSearch** | ~15KB | ⭐⭐⭐⭐⭐ | Fast, memory efficient | Large datasets |
| **MiniSearch** | ~20KB | ⭐⭐⭐ | Simple, lightweight | Small sites |
| **Fuse.js** | ~25KB | ⭐⭐⭐ | Fuzzy matching | Typo tolerance |

## Recommendations

### **Choose Lunr.js if:**
- You want the most mature and feature-rich solution
- You need advanced search features (boosting, fuzzy search)
- You have a medium-sized site (100-1000 documents)

### **Choose FlexSearch if:**
- You have a large site (> 1000 documents)
- Performance is critical
- You want the smallest bundle size

### **Choose MiniSearch if:**
- You have a small site (< 100 documents)
- You want simplicity
- Bundle size is important

### **Choose Fuse.js if:**
- You need excellent fuzzy matching
- Typo tolerance is important
- You want simple configuration

## Implementation Checklist

- [ ] Choose search solution based on requirements
- [ ] Set up content indexing in build process
- [ ] Create search component
- [ ] Integrate with layout/navigation
- [ ] Add search page (optional)
- [ ] Test search functionality
- [ ] Optimize performance
- [ ] Add keyboard navigation
- [ ] Test accessibility

This guide provides everything needed to implement client-side search that works entirely in the browser without any external dependencies or services!
