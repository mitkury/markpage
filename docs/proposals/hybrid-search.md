# Hybrid Search: Semantic + Literal Search

A comprehensive guide for implementing hybrid search that combines semantic search with literal/full-text search to provide the best search experience for markpage websites.

## Overview

Hybrid search combines the strengths of both approaches:
- **Semantic Search**: Understands meaning and context (AI-powered)
- **Literal Search**: Exact keyword matching and fuzzy search
- **Result Fusion**: Intelligently combines results from both approaches

## Why Hybrid Search?

### **Semantic Search Strengths:**
- ✅ Understands synonyms and related concepts
- ✅ Handles natural language queries
- ✅ Finds relevant content even without exact keywords
- ✅ Better for complex, conceptual searches

### **Literal Search Strengths:**
- ✅ Fast and reliable
- ✅ Exact keyword matching
- ✅ Handles technical terms and code
- ✅ Works offline
- ✅ No external dependencies

### **Hybrid Benefits:**
- 🎯 **Best of both worlds** - semantic understanding + exact matching
- 📈 **Higher recall** - finds more relevant results
- 🎯 **Better precision** - ranks results more accurately
- 🔄 **Fallback support** - works even if semantic search fails
- ⚡ **Performance** - can cache semantic embeddings

## Implementation Approaches

### 1. **Client-Side Hybrid Search**

#### **Lunr.js + Embeddings**

```typescript
// src/lib/hybrid-search.ts
import lunr from 'lunr';
import { embedText } from './embeddings';

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  section?: string;
  tags?: string[];
  embedding?: number[];
}

export interface SearchResult {
  document: SearchDocument;
  literalScore: number;
  semanticScore: number;
  combinedScore: number;
  matchType: 'literal' | 'semantic' | 'hybrid';
}

export class HybridSearch {
  private literalIndex: lunr.Index;
  private documents: SearchDocument[];
  private embeddings: Map<string, number[]>;

  constructor(documents: SearchDocument[]) {
    this.documents = documents;
    this.embeddings = new Map();
    
    // Build literal search index
    this.literalIndex = lunr(function() {
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

  async initializeEmbeddings() {
    // Generate embeddings for all documents
    for (const doc of this.documents) {
      const text = `${doc.title} ${doc.content}`;
      const embedding = await embedText(text);
      this.embeddings.set(doc.id, embedding);
    }
  }

  async search(query: string, limit = 10): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // 1. Literal search
    const literalResults = this.literalIndex.search(query);
    const literalScores = new Map<string, number>();
    
    literalResults.forEach(result => {
      literalScores.set(result.ref, result.score || 0);
    });

    // 2. Semantic search
    const queryEmbedding = await embedText(query);
    const semanticScores = new Map<string, number>();
    
    for (const [docId, docEmbedding] of this.embeddings) {
      const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
      semanticScores.set(docId, similarity);
    }

    // 3. Combine results
    const allDocIds = new Set([
      ...literalScores.keys(),
      ...semanticScores.keys()
    ]);

    for (const docId of allDocIds) {
      const document = this.documents.find(d => d.id === docId);
      if (!document) continue;

      const literalScore = literalScores.get(docId) || 0;
      const semanticScore = semanticScores.get(docId) || 0;
      
      // Determine match type
      let matchType: 'literal' | 'semantic' | 'hybrid';
      if (literalScore > 0 && semanticScore > 0.3) {
        matchType = 'hybrid';
      } else if (literalScore > 0) {
        matchType = 'literal';
      } else {
        matchType = 'semantic';
      }

      // Combine scores (weighted average)
      const combinedScore = this.combineScores(literalScore, semanticScore);

      results.push({
        document,
        literalScore,
        semanticScore,
        combinedScore,
        matchType
      });
    }

    // Sort by combined score and limit
    return results
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private combineScores(literalScore: number, semanticScore: number): number {
    // Normalize scores to 0-1 range
    const normalizedLiteral = Math.min(literalScore / 10, 1);
    const normalizedSemantic = semanticScore;
    
    // Weighted combination (adjust weights based on preference)
    const literalWeight = 0.6;
    const semanticWeight = 0.4;
    
    return (normalizedLiteral * literalWeight) + (normalizedSemantic * semanticWeight);
  }
}
```

#### **Embeddings Implementation**

```typescript
// src/lib/embeddings.ts
import { pipeline } from '@xenova/transformers';

let embedder: any = null;

export async function embedText(text: string): Promise<number[]> {
  if (!embedder) {
    // Load the embedding model (runs in browser)
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  
  const result = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

// Alternative: Use a smaller model for better performance
export async function embedTextFast(text: string): Promise<number[]> {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/paraphrase-MiniLM-L3-v2');
  }
  
  const result = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}
```

### 2. **Build-Time Hybrid Search**

#### **Pre-computed Embeddings**

```typescript
// scripts/build-hybrid-search.ts
import { buildPages } from 'markpage/builder';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { embedText } from './embeddings';

export interface HybridSearchDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  section?: string;
  tags?: string[];
  embedding: number[];
  keywords: string[];
}

export async function buildHybridSearchIndex(contentPath: string): Promise<{
  documents: HybridSearchDocument[];
  literalIndex: any;
}> {
  const result = await buildPages(contentPath, {
    includeContent: true
  });
  
  const documents: HybridSearchDocument[] = [];
  
  function processItems(items: any[], parentPath = '') {
    for (const item of items) {
      if (item.type === 'page' && item.path) {
        const content = result.content?.[item.path];
        if (content) {
          const title = extractTitle(content);
          const tags = extractTags(content);
          const cleanContent = cleanContent(content);
          const keywords = extractKeywords(cleanContent);
          
          // Generate embedding
          const text = `${title} ${cleanContent}`;
          const embedding = await embedText(text);
          
          documents.push({
            id: item.path,
            title,
            content: cleanContent,
            url: `/${item.path.replace(/\.md$/, '')}`,
            section: parentPath || undefined,
            tags: tags.length > 0 ? tags : undefined,
            embedding,
            keywords
          });
        }
      } else if (item.items) {
        const sectionPath = parentPath ? `${parentPath} > ${item.label}` : item.label;
        processItems(item.items, sectionPath);
      }
    }
  }
  
  await processItems(result.navigation.items);
  
  // Build literal search index
  const literalIndex = buildLiteralIndex(documents);
  
  return { documents, literalIndex };
}

function extractKeywords(content: string): string[] {
  // Extract important keywords from content
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Return top keywords
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

function buildLiteralIndex(documents: HybridSearchDocument[]) {
  // Build a lightweight literal search index
  const index: Record<string, any> = {};
  
  documents.forEach(doc => {
    const terms = [
      ...doc.title.toLowerCase().split(/\s+/),
      ...doc.content.toLowerCase().split(/\s+/),
      ...(doc.keywords || [])
    ];
    
    terms.forEach(term => {
      if (!index[term]) {
        index[term] = [];
      }
      if (!index[term].includes(doc.id)) {
        index[term].push(doc.id);
      }
    });
  });
  
  return index;
}
```

### 3. **Svelte Component with Hybrid Search**

```svelte
<!-- src/lib/components/HybridSearch.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { HybridSearch, type SearchResult } from '$lib/hybrid-search';
  
  export let documents: any[] = [];
  export let placeholder = 'Search with semantic understanding...';
  export let maxResults = 10;
  export let showMatchType = true;
  
  let searchQuery = '';
  let searchResults: SearchResult[] = [];
  let searchInstance: HybridSearch;
  let isSearching = false;
  let showResults = false;
  let searchMode: 'hybrid' | 'literal' | 'semantic' = 'hybrid';
  
  const dispatch = createEventDispatcher();
  
  // Initialize search
  $: {
    if (documents.length > 0 && !searchInstance) {
      searchInstance = new HybridSearch(documents);
      searchInstance.initializeEmbeddings();
    }
  }
  
  // Perform search with debouncing
  let searchTimeout: number;
  $: {
    if (searchInstance && searchQuery.trim()) {
      clearTimeout(searchTimeout);
      isSearching = true;
      showResults = true;
      
      searchTimeout = setTimeout(async () => {
        try {
          searchResults = await searchInstance.search(searchQuery, maxResults);
        } catch (error) {
          console.error('Search error:', error);
          searchResults = [];
        }
        isSearching = false;
      }, 300);
    } else {
      searchResults = [];
      showResults = false;
    }
  }
  
  function handleResultClick(result: SearchResult) {
    dispatch('resultClick', result);
    showResults = false;
    searchQuery = '';
  }
  
  function getMatchTypeIcon(matchType: string): string {
    switch (matchType) {
      case 'hybrid': return '🔗';
      case 'literal': return '📝';
      case 'semantic': return '🧠';
      default: return '🔍';
    }
  }
  
  function getMatchTypeLabel(matchType: string): string {
    switch (matchType) {
      case 'hybrid': return 'Hybrid Match';
      case 'literal': return 'Exact Match';
      case 'semantic': return 'Semantic Match';
      default: return 'Match';
    }
  }
</script>

<div class="hybrid-search-container">
  <div class="search-controls">
    <div class="search-input-wrapper">
      <input
        type="text"
        bind:value={searchQuery}
        {placeholder}
        class="search-input"
        aria-label="Search documentation"
      />
      {#if isSearching}
        <div class="search-spinner">🔍</div>
      {/if}
    </div>
    
    <div class="search-mode-selector">
      <label>
        <input 
          type="radio" 
          bind:group={searchMode} 
          value="hybrid"
        />
        Hybrid
      </label>
      <label>
        <input 
          type="radio" 
          bind:group={searchMode} 
          value="literal"
        />
        Literal
      </label>
      <label>
        <input 
          type="radio" 
          bind:group={searchMode} 
          value="semantic"
        />
        Semantic
      </label>
    </div>
  </div>
  
  {#if showResults && searchResults.length > 0}
    <div class="search-results" role="listbox">
      {#each searchResults as result (result.document.id)}
        <div 
          class="search-result"
          on:click={() => handleResultClick(result)}
          role="option"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && handleResultClick(result)}
        >
          <div class="result-header">
            <h4 class="result-title">{result.document.title}</h4>
            {#if showMatchType}
              <span class="match-type" title={getMatchTypeLabel(result.matchType)}>
                {getMatchTypeIcon(result.matchType)}
              </span>
            {/if}
            {#if result.document.section}
              <span class="result-section">{result.document.section}</span>
            {/if}
          </div>
          
          <p class="result-excerpt">
            {result.document.content.substring(0, 150)}
            {result.document.content.length > 150 ? '...' : ''}
          </p>
          
          <div class="result-scores">
            <span class="score literal-score">
              Literal: {(result.literalScore * 100).toFixed(1)}%
            </span>
            <span class="score semantic-score">
              Semantic: {(result.semanticScore * 100).toFixed(1)}%
            </span>
            <span class="score combined-score">
              Combined: {(result.combinedScore * 100).toFixed(1)}%
            </span>
          </div>
          
          {#if result.document.tags && result.document.tags.length > 0}
            <div class="result-tags">
              {#each result.document.tags as tag}
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
        Try different keywords or rephrase your query
      </p>
    </div>
  {/if}
</div>

<style>
  .hybrid-search-container {
    position: relative;
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
  }
  
  .search-controls {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .search-input-wrapper {
    position: relative;
    flex: 1;
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
  
  .search-mode-selector {
    display: flex;
    gap: 12px;
    font-size: 14px;
  }
  
  .search-mode-selector label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
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
    max-height: 600px;
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
    flex: 1;
  }
  
  .match-type {
    font-size: 16px;
    cursor: help;
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
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #475569;
    line-height: 1.5;
  }
  
  .result-scores {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 12px;
  }
  
  .score {
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .literal-score {
    background: #eff6ff;
    color: #1d4ed8;
  }
  
  .semantic-score {
    background: #fef3c7;
    color: #d97706;
  }
  
  .combined-score {
    background: #dcfce7;
    color: #16a34a;
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

## Performance Optimization

### 1. **Embedding Caching**

```typescript
// Cache embeddings in localStorage or IndexedDB
export class EmbeddingCache {
  private cache: Map<string, number[]> = new Map();
  
  async getEmbedding(text: string): Promise<number[]> {
    const hash = this.hashText(text);
    
    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }
    
    const embedding = await embedText(text);
    this.cache.set(hash, embedding);
    return embedding;
  }
  
  private hashText(text: string): string {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}
```

### 2. **Progressive Loading**

```typescript
// Load semantic search progressively
export class ProgressiveHybridSearch {
  private literalResults: SearchResult[] = [];
  private semanticResults: SearchResult[] = [];
  
  async search(query: string, limit = 10): Promise<SearchResult[]> {
    // 1. Show literal results immediately
    this.literalResults = this.performLiteralSearch(query, limit);
    
    // 2. Load semantic results in background
    setTimeout(async () => {
      this.semanticResults = await this.performSemanticSearch(query, limit);
      this.combineResults();
    }, 100);
    
    return this.literalResults;
  }
}
```

### 3. **Web Workers**

```typescript
// Move heavy computation to web worker
// search-worker.js
import { embedText } from './embeddings';

self.onmessage = async function(e) {
  const { type, query, documents } = e.data;
  
  if (type === 'semantic-search') {
    const queryEmbedding = await embedText(query);
    const results = [];
    
    for (const doc of documents) {
      const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
      results.push({ id: doc.id, score: similarity });
    }
    
    self.postMessage({ type: 'semantic-results', results });
  }
};
```

## Comparison with Pure Solutions

| Aspect | Pure Literal | Pure Semantic | Hybrid |
|--------|--------------|---------------|---------|
| **Accuracy** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Offline** | ✅ | ❌ | ✅ |
| **Bundle Size** | Small | Large | Medium |
| **Complexity** | Low | High | Medium |
| **Fallback** | N/A | N/A | ✅ |

## Implementation Checklist

- [ ] Choose embedding model (client-side vs build-time)
- [ ] Implement literal search index
- [ ] Set up semantic search with embeddings
- [ ] Create result fusion algorithm
- [ ] Build hybrid search component
- [ ] Add performance optimizations
- [ ] Test with various query types
- [ ] Optimize bundle size
- [ ] Add fallback mechanisms

## Recommendations

### **Use Hybrid Search When:**
- You want the best possible search accuracy
- You have diverse content types
- Users expect both exact and conceptual matches
- You can afford the additional complexity

### **Stick with Literal Search When:**
- Performance is critical
- Bundle size is a concern
- Content is mostly technical/structured
- You need offline functionality

### **Use Pure Semantic Search When:**
- Content is highly conceptual
- Users write natural language queries
- You have server-side processing available

Hybrid search provides the best user experience by combining the strengths of both approaches while maintaining reasonable performance and bundle size!
