# Search Solutions Quick Reference

Quick comparison and setup guide for the most popular search solutions for svelte-markdown-pages.

## Quick Comparison

| Solution | Setup Time | Cost | Performance | Features | Best For |
|----------|------------|------|-------------|----------|----------|
| **Algolia DocSearch** | ⭐⭐⭐ | Free (OSS) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Production sites |
| **Lunr.js** | ⭐⭐⭐⭐⭐ | Free | ⭐⭐⭐ | ⭐⭐ | Small sites |
| **Meilisearch** | ⭐⭐⭐ | Free | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Self-hosted |
| **Typesense** | ⭐⭐⭐ | Free | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Modern apps |

## 1. Algolia DocSearch (Recommended)

### Quick Setup
```bash
npm install @docsearch/react @docsearch/js
```

### Basic Implementation
```svelte
<script>
  import { onMount } from 'svelte';
  import '@docsearch/css';
  
  let searchContainer;
  
  onMount(() => {
    import('@docsearch/js').then(({ default: docsearch }) => {
      docsearch({
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_API_KEY',
        indexName: 'your-index',
        container: searchContainer
      });
    });
  });
</script>

<div bind:this={searchContainer}></div>
```

### Pros
- ✅ Free for open source
- ✅ Excellent relevance
- ✅ Built-in analytics
- ✅ Typo tolerance

### Cons
- ❌ Application process required
- ❌ Limited customization (free tier)

## 2. Lunr.js (Client-Side)

### Quick Setup
```bash
npm install lunr
```

### Basic Implementation
```typescript
import lunr from 'lunr';

const idx = lunr(function() {
  this.ref('id');
  this.field('title', { boost: 10 });
  this.field('content');
  
  documents.forEach(doc => this.add(doc));
});

const results = idx.search('query');
```

### Pros
- ✅ No server required
- ✅ Full control
- ✅ Fast for small datasets
- ✅ Zero cost

### Cons
- ❌ Limited to client-side
- ❌ Not suitable for large datasets
- ❌ Basic semantic capabilities

## 3. Meilisearch (Self-Hosted)

### Quick Setup
```bash
# Install Meilisearch
curl -L https://install.meilisearch.com | sh

# Start server
./meilisearch --master-key=your-master-key

# Install client
npm install meilisearch-instant-meilisearch
```

### Basic Implementation
```svelte
<script>
  import { onMount } from 'svelte';
  import { instantMeiliSearch } from 'meilisearch-instant-meilisearch';
  
  let searchContainer;
  
  onMount(() => {
    const { instantSearch } = instantMeiliSearch(
      'http://localhost:7700',
      'your-search-key'
    );
    instantSearch.mount(searchContainer);
  });
</script>

<div bind:this={searchContainer}></div>
```

### Pros
- ✅ Open source
- ✅ Excellent performance
- ✅ Full control
- ✅ Typo tolerance

### Cons
- ❌ Requires server setup
- ❌ More maintenance

## 4. Typesense (Modern Alternative)

### Quick Setup
```bash
# Install Typesense
docker run -p 8108:8108 typesense/typesense:latest

# Install client
npm install typesense-instantsearch-adapter
```

### Basic Implementation
```svelte
<script>
  import { onMount } from 'svelte';
  import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
  
  let searchContainer;
  
  onMount(() => {
    const adapter = new TypesenseInstantSearchAdapter({
      server: {
        apiKey: 'your-api-key',
        nodes: [{ host: 'localhost', port: '8108', protocol: 'http' }]
      }
    });
    
    const search = instantsearch({
      searchClient: adapter.searchClient,
      indexName: 'docs'
    });
    
    search.addWidgets([
      instantsearch.widgets.searchBox({ container: searchContainer })
    ]);
    
    search.start();
  });
</script>

<div bind:this={searchContainer}></div>
```

### Pros
- ✅ Open source
- ✅ Excellent performance
- ✅ Real-time updates
- ✅ Built-in analytics

### Cons
- ❌ Requires server setup
- ❌ Smaller community

## Integration with svelte-markdown-pages

### Content Extraction
```typescript
import { buildPages } from 'svelte-markdown-pages/builder';

async function extractSearchContent(contentPath: string) {
  const result = await buildPages(contentPath, { includeContent: true });
  
  return Object.entries(result.content || {}).map(([path, content]) => ({
    id: path,
    title: extractTitle(content),
    content: cleanContent(content),
    url: `/${path.replace(/\.md$/, '')}`
  }));
}
```

### Build Integration
```json
{
  "scripts": {
    "build:search": "node scripts/build-search-index.js",
    "build": "npm run build:docs && npm run build:search"
  }
}
```

## Quick Decision Guide

### Choose Algolia DocSearch if:
- You have a production site
- You want the best search experience
- You're okay with the application process
- You want analytics and insights

### Choose Lunr.js if:
- You have a small site (< 100 pages)
- You want zero external dependencies
- You want full control over search
- You want to keep everything client-side

### Choose Meilisearch if:
- You want self-hosted control
- You have technical expertise
- You want excellent performance
- You want to avoid vendor lock-in

### Choose Typesense if:
- You want modern features
- You need real-time updates
- You want built-in analytics
- You're comfortable with server setup

## Getting Started Checklist

1. **Choose your solution** based on requirements
2. **Install dependencies** for your chosen solution
3. **Set up search service** (if required)
4. **Extract content** from your markdown files
5. **Create search index** with your content
6. **Implement search UI** component
7. **Integrate with layout** and navigation
8. **Test and optimize** search functionality

## Resources

- [Algolia DocSearch](https://docsearch.algolia.com/)
- [Lunr.js Documentation](https://lunrjs.com/)
- [Meilisearch Documentation](https://docs.meilisearch.com/)
- [Typesense Documentation](https://typesense.org/docs/)
- [svelte-markdown-pages Documentation](../README.md)
