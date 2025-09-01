# Semantic Search Implementation Guide

A guide for adding semantic search functionality to markpage websites using various solutions.

## Overview

Semantic search allows users to find content using natural language queries, understanding context and meaning rather than just keyword matching. This guide covers several approaches to implement search in markpage websites.

## Search Solutions

### 1. **Algolia DocSearch** (Recommended for Production)

**Best for**: Large documentation sites, production applications
**Pros**: 
- Free for open source projects
- Excellent relevance and typo tolerance
- Built-in analytics and insights
- Easy integration with SvelteKit
- Handles large datasets efficiently

**Cons**: 
- Requires application process for free tier
- Limited customization on free plan

#### Implementation

```bash
npm install @docsearch/react @docsearch/js
```

```svelte
<!-- src/lib/components/Search.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import '@docsearch/css';

  let searchContainer: HTMLElement;

  onMount(() => {
    import('@docsearch/js').then(({ default: docsearch }) => {
      docsearch({
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_API_KEY',
        indexName: 'your-index-name',
        container: searchContainer,
        placeholder: 'Search documentation...',
        searchParameters: {
          facetFilters: ['type:content']
        }
      });
    });
  });
</script>

<div class="search-wrapper">
  <div bind:this={searchContainer}></div>
</div>

<style>
  .search-wrapper {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
</style>
```

#### Setup Process
1. Apply for DocSearch at https://docsearch.algolia.com/
2. Configure your site structure
3. Algolia will crawl your site and create search index
4. Receive API credentials and integrate

### 2. **Meilisearch** (Self-Hosted Alternative)

**Best for**: Self-hosted solutions, full control
**Pros**: 
- Open source and self-hosted
- Excellent performance
- Full control over data and configuration
- Typo tolerance and relevance
- RESTful API

**Cons**: 
- Requires server infrastructure
- More setup and maintenance

#### Implementation

```bash
npm install meilisearch-instant-meilisearch
```

```svelte
<!-- src/lib/components/MeiliSearch.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { instantMeiliSearch } from 'meilisearch-instant-meilisearch';

  let searchContainer: HTMLElement;
  let searchClient: any;

  onMount(() => {
    const { searchClient: client, instantSearch } = instantMeiliSearch(
      'http://localhost:7700',
      'your-search-key'
    );
    
    searchClient = client;
    instantSearch.mount(searchContainer);
  });
</script>

<div class="search-wrapper">
  <div bind:this={searchContainer}></div>
</div>
```

#### Setup Process
1. Install Meilisearch server
2. Create search index
3. Index your content
4. Configure search parameters

### 3. **Typesense** (Modern Alternative)

**Best for**: Modern applications, real-time search
**Pros**: 
- Open source
- Excellent performance
- Built-in analytics
- Real-time updates
- Good documentation

**Cons**: 
- Requires server setup
- Smaller community than Algolia

#### Implementation

```bash
npm install typesense-instantsearch-adapter
```

```svelte
<!-- src/lib/components/TypesenseSearch.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';

  let searchContainer: HTMLElement;

  onMount(() => {
    const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
      server: {
        apiKey: 'your-api-key',
        nodes: [{
          host: 'localhost',
          port: '8108',
          protocol: 'http'
        }]
      },
      additionalSearchParameters: {
        queryBy: 'title,content',
        sortBy: 'relevance_score:desc'
      }
    });

    const search = instantsearch({
      searchClient: typesenseInstantsearchAdapter.searchClient,
      indexName: 'docs'
    });

    search.addWidgets([
      instantsearch.widgets.searchBox({
        container: searchContainer,
        placeholder: 'Search documentation...'
      })
    ]);

    search.start();
  });
</script>

<div class="search-wrapper">
  <div bind:this={searchContainer}></div>
</div>
```

### 4. **Local Search with Lunr.js** (Client-Side)

**Best for**: Small to medium sites, no server required
**Pros**: 
- No server required
- Works entirely in browser
- Fast for small datasets
- Full control over search logic

**Cons**: 
- Limited to client-side processing
- Not suitable for large datasets
- Basic semantic capabilities

#### Implementation

```bash
npm install lunr
```

```typescript
// src/lib/search.ts
import lunr from 'lunr';

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  section?: string;
}

export class LocalSearch {
  private index: lunr.Index;
  private documents: SearchDocument[];

  constructor(documents: SearchDocument[]) {
    this.documents = documents;
    this.index = lunr(function() {
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('content');
      this.field('section');

      documents.forEach(doc => {
        this.add(doc);
      });
    });
  }

  search(query: string): SearchDocument[] {
    const results = this.index.search(query);
    return results.map(result => 
      this.documents.find(doc => doc.id === result.ref)!
    );
  }
}
```

```svelte
<!-- src/lib/components/LocalSearch.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { LocalSearch, type SearchDocument } from '$lib/search';
  
  export let documents: SearchDocument[] = [];
  
  let searchQuery = '';
  let searchResults: SearchDocument[] = [];
  let searchInstance: LocalSearch;
  let isSearching = false;
  
  const dispatch = createEventDispatcher();
  
  $: {
    if (documents.length > 0 && !searchInstance) {
      searchInstance = new LocalSearch(documents);
    }
  }
  
  $: {
    if (searchInstance && searchQuery.trim()) {
      isSearching = true;
      searchResults = searchInstance.search(searchQuery);
      isSearching = false;
    } else {
      searchResults = [];
    }
  }
  
  function handleResultClick(result: SearchDocument) {
    dispatch('resultClick', result);
  }
</script>

<div class="search-container">
  <input
    type="text"
    bind:value={searchQuery}
    placeholder="Search documentation..."
    class="search-input"
  />
  
  {#if isSearching}
    <div class="search-loading">Searching...</div>
  {:else if searchResults.length > 0}
    <div class="search-results">
      {#each searchResults as result}
        <div 
          class="search-result"
          on:click={() => handleResultClick(result)}
        >
          <h4>{result.title}</h4>
          {#if result.section}
            <span class="section">{result.section}</span>
          {/if}
          <p>{result.content.substring(0, 150)}...</p>
        </div>
      {/each}
    </div>
  {:else if searchQuery.trim()}
    <div class="no-results">No results found</div>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 600px;
  }
  
  .search-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
  }
  
  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
  }
  
  .search-result {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
  }
  
  .search-result:hover {
    background: #f8fafc;
  }
  
  .search-result h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
  }
  
  .section {
    font-size: 12px;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .search-result p {
    margin: 8px 0 0 0;
    font-size: 13px;
    color: #475569;
  }
</style>
```

### 5. **OpenSearch (AWS)** (Enterprise)

**Best for**: Enterprise applications, AWS ecosystem
**Pros**: 
- Fully managed service
- Excellent scalability
- Advanced analytics
- Integration with AWS services

**Cons**: 
- Requires AWS account
- More complex setup
- Cost for large datasets

## Integration with markpage

### Content Indexing

To make your content searchable, you'll need to extract and index your markdown content:

```typescript
// src/lib/search-index.ts
import { buildPages } from 'markpage/builder';
import type { SearchDocument } from './search';

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
          // Extract title from first heading
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : item.label;
          
          // Clean content (remove markdown)
          const cleanContent = content
            .replace(/^#+\s+/gm, '') // Remove headings
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
            .replace(/`([^`]+)`/g, '$1') // Remove inline code
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .trim();
          
          documents.push({
            id: item.path,
            title,
            content: cleanContent,
            url: `/${item.path.replace(/\.md$/, '')}`,
            section: parentPath || undefined
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
```

### Build Integration

Add search index generation to your build process:

```typescript
// scripts/build-with-search.js
import { buildSearchIndex } from '../src/lib/search-index.js';
import { writeFileSync } from 'fs';

async function buildWithSearch() {
  // Build documentation
  await buildPages('./docs', {
    appOutput: './src/lib/content',
    includeContent: true
  });
  
  // Build search index
  const searchDocuments = await buildSearchIndex('./docs');
  writeFileSync(
    './src/lib/search-index.json',
    JSON.stringify(searchDocuments, null, 2)
  );
}

buildWithSearch().catch(console.error);
```

### SvelteKit Integration

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import Search from '$lib/components/Search.svelte';
  import searchIndex from '$lib/search-index.json';
</script>

<header>
  <Search {searchIndex} />
</header>

<main>
  <slot />
</main>
```

## Recommendations by Use Case

### **Small Documentation Site (< 100 pages)**
- **Recommendation**: Local Search with Lunr.js
- **Reason**: Simple setup, no external dependencies, fast performance

### **Medium Documentation Site (100-1000 pages)**
- **Recommendation**: Algolia DocSearch
- **Reason**: Excellent relevance, free for open source, easy integration

### **Large Documentation Site (> 1000 pages)**
- **Recommendation**: Meilisearch or Typesense
- **Reason**: Self-hosted control, excellent performance, cost-effective

### **Enterprise/Production Application**
- **Recommendation**: Algolia DocSearch or OpenSearch
- **Reason**: Managed service, enterprise features, reliability

### **Open Source Project**
- **Recommendation**: Algolia DocSearch
- **Reason**: Free tier available, excellent for community projects

## Implementation Checklist

- [ ] Choose search solution based on requirements
- [ ] Set up search service/engine
- [ ] Implement content indexing
- [ ] Create search UI component
- [ ] Integrate with markpage build process
- [ ] Add search to layout/navigation
- [ ] Test search functionality
- [ ] Optimize search performance
- [ ] Add analytics and monitoring

## Performance Considerations

1. **Index Size**: Keep search index optimized for your use case
2. **Caching**: Cache search results when possible
3. **Debouncing**: Implement search debouncing for better UX
4. **Lazy Loading**: Load search results progressively
5. **CDN**: Use CDN for search assets when applicable

## Security Considerations

1. **API Keys**: Secure API keys and credentials
2. **Rate Limiting**: Implement rate limiting for search requests
3. **Input Validation**: Sanitize search queries
4. **Access Control**: Ensure search respects content permissions

This guide provides a comprehensive overview of implementing semantic search in markpage websites, with specific recommendations based on different use cases and requirements.
