# Image Support for Markpage

A proposal for adding comprehensive image support to Markpage, allowing users to include images alongside their markdown content with automatic asset management.

## Overview

Currently, Markpage focuses on markdown content and navigation structure. Adding image support would enhance the content creation experience by allowing users to include images directly in their content directories and have them automatically processed and served.

## Goals

- **Seamless Integration**: Images stored alongside markdown files for easy content management
- **Automatic Processing**: Images automatically copied to appropriate static directories during build
- **Multiple Output Support**: Works with app bundles, website builds, and static site generation
- **Flexible Referencing**: Support for both relative and absolute image paths
- **Performance Optimized**: Automatic image optimization and responsive image generation

## Proposed Implementation

### 1. **Content Structure**

Images would be stored directly in content directories alongside markdown files:

```
my-content/
├── .index.json
├── getting-started.md
├── hero-image.png          # Image file
├── guides/
│   ├── .index.json
│   ├── installation.md
│   └── screenshots/
│       ├── step1.png       # Nested images
│       └── step2.png
└── assets/
    ├── logo.svg            # Organized assets
    └── icons/
        └── check.svg
```

### 2. **Image Processing Pipeline**

#### Build-Time Processing
```typescript
interface ImageProcessingOptions {
  // Source and destination
  sourceDir: string;
  outputDir: string;
  
  // Processing options
  optimize: boolean;
  generateResponsive: boolean;
  formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
  
  // Quality settings
  quality: number;
  maxWidth: number;
  
  // Naming conventions
  preserveStructure: boolean;
  hashFilenames: boolean;
}
```

#### Asset Collection
```typescript
interface ImageAsset {
  sourcePath: string;        // Original path in content
  outputPath: string;        // Final path in build output
  relativeUrl: string;       // URL for markdown references
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  responsive?: {
    sizes: string[];
    srcset: string;
  };
}
```

### 3. **Builder Integration**

#### Enhanced Builder Options
```typescript
interface BuildOptions {
  // Existing options...
  appOutput: string;
  websiteOutput: string;
  includeContent: boolean;
  
  // New image options
  images: {
    enabled: boolean;
    sourceDir?: string;      // Defaults to content directory
    outputDir?: string;      // Defaults to 'images' in output
    optimize: boolean;
    generateResponsive: boolean;
    formats: string[];
    quality: number;
    maxWidth: number;
  };
}
```

#### Build Process
```typescript
async function buildPages(contentPath: string, options: BuildOptions) {
  // Existing content processing...
  const contentResult = await processContent(contentPath, options);
  
  // New image processing
  if (options.images?.enabled) {
    const imageResult = await processImages(
      options.images.sourceDir || contentPath,
      options.images.outputDir || path.join(options.appOutput, 'images'),
      options.images
    );
    
    // Update content to reference processed images
    const updatedContent = await updateImageReferences(
      contentResult,
      imageResult
    );
    
    return { ...contentResult, images: imageResult, content: updatedContent };
  }
  
  return contentResult;
}
```

### 4. **Image Reference Handling**

#### Markdown Integration
```markdown
<!-- Standard markdown image syntax -->
![Hero Image](hero-image.png)

<!-- With responsive images -->
![Responsive Image](hero-image.png){: .responsive}

<!-- With custom attributes -->
![Custom Image](hero-image.png){: .rounded .shadow width="800" height="600"}
```

#### Reference Processing
```typescript
interface ImageReference {
  originalPath: string;      // Path in markdown
  processedPath: string;     // Final URL after processing
  attributes: Record<string, string>;
  responsive: boolean;
}

function processImageReferences(content: string, imageMap: Map<string, ImageAsset>): string {
  // Find all image references in markdown
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)(\{[^}]*\})?/g;
  
  return content.replace(imageRegex, (match, alt, src, attrs) => {
    const asset = imageMap.get(src);
    if (!asset) return match;
    
    // Process attributes and generate responsive markup
    const processedAttrs = parseAttributes(attrs);
    const responsiveMarkup = generateResponsiveMarkup(asset, processedAttrs);
    
    return responsiveMarkup;
  });
}
```

### 5. **Static Site Generation**

#### Enhanced Static Generator
```typescript
interface StaticSiteOptions {
  // Existing options...
  title: string;
  baseUrl: string;
  
  // Image options
  images: {
    enabled: boolean;
    optimize: boolean;
    generateResponsive: boolean;
    formats: string[];
    quality: number;
    maxWidth: number;
  };
}

async function generateStaticSite(
  contentPath: string, 
  outputPath: string, 
  options: StaticSiteOptions
) {
  // Process content and images
  const buildResult = await buildPages(contentPath, {
    websiteOutput: outputPath,
    images: options.images
  });
  
  // Generate static HTML with image support
  const htmlResult = await generateStaticHTML(buildResult, options);
  
  // Copy processed images to static output
  await copyImages(buildResult.images, outputPath);
  
  return htmlResult;
}
```

### 6. **CLI Enhancements**

#### New CLI Commands
```bash
# Build with image processing
npx markpage build ./content --output ./dist --images

# Build with custom image options
npx markpage build ./content --output ./dist \
  --images \
  --image-optimize \
  --image-formats webp,avif \
  --image-quality 85 \
  --image-max-width 1920

# Generate static site with images
npx markpage static ./content --output ./dist --images
```

#### CLI Options
```typescript
interface CLIOptions {
  // Existing options...
  output: string;
  includeContent: boolean;
  
  // Image options
  images: boolean;
  imageOptimize: boolean;
  imageFormats: string;
  imageQuality: number;
  imageMaxWidth: number;
}
```

## Implementation Phases

### Phase 1: Basic Image Support
- [ ] Image file detection and collection
- [ ] Basic copying to output directories
- [ ] Simple markdown reference processing
- [ ] Integration with existing builder

### Phase 2: Image Optimization
- [ ] Image compression and format conversion
- [ ] Responsive image generation
- [ ] Quality and size optimization
- [ ] WebP and AVIF support

### Phase 3: Advanced Features
- [ ] Image metadata extraction
- [ ] Lazy loading support
- [ ] Image caching strategies
- [ ] CDN integration support

### Phase 4: Developer Experience
- [ ] CLI enhancements
- [ ] Configuration validation
- [ ] Error handling and reporting
- [ ] Documentation and examples

## Technical Considerations

### Dependencies
- **Sharp**: For image processing and optimization
- **Glob**: For file pattern matching
- **Path**: For cross-platform path handling

### Performance
- **Parallel Processing**: Process multiple images concurrently
- **Caching**: Cache processed images to avoid reprocessing
- **Lazy Processing**: Only process images that are actually referenced

### Compatibility
- **File Formats**: Support common web formats (PNG, JPEG, GIF, SVG, WebP, AVIF)
- **Platform Support**: Ensure cross-platform compatibility
- **Build Tools**: Integrate with existing build pipelines

## Example Usage

### Basic Setup
```typescript
import { buildPages } from 'markpage/builder';

await buildPages('./content', {
  appOutput: './src/lib/content',
  websiteOutput: './src/lib/content',
  includeContent: true,
  images: {
    enabled: true,
    optimize: true,
    generateResponsive: true,
    formats: ['webp', 'avif'],
    quality: 85,
    maxWidth: 1920
  }
});
```

### Content Structure
```markdown
# Getting Started

Here's how to set up your project:

![Setup Screenshot](screenshots/setup.png)

The installation process is straightforward:

1. **Download** the package
2. **Install** dependencies  
3. **Configure** your settings

![Installation Steps](screenshots/install-steps.png){: .border .shadow}
```

### Generated Output
```html
<picture>
  <source srcset="images/screenshots/setup.webp" type="image/webp">
  <source srcset="images/screenshots/setup.avif" type="image/avif">
  <img src="images/screenshots/setup.png" alt="Setup Screenshot" class="border shadow">
</picture>
```

## Benefits

1. **Improved Content Management**: Images stored alongside content for easy maintenance
2. **Better Performance**: Automatic optimization and responsive image generation
3. **Developer Experience**: Seamless integration with existing workflows
4. **Flexibility**: Support for multiple output formats and use cases
5. **Standards Compliance**: Follows web standards for responsive images

## Challenges and Mitigation

### Challenge: Build Time
- **Mitigation**: Implement caching and parallel processing

### Challenge: File Size
- **Mitigation**: Automatic optimization and format conversion

### Challenge: Complexity
- **Mitigation**: Sensible defaults and clear configuration options

## Conclusion

Adding image support to Markpage would significantly enhance its capabilities as a content management tool. The proposed implementation provides a solid foundation for image handling while maintaining the simplicity and flexibility that makes Markpage valuable.

The phased approach allows for incremental development and testing, ensuring that each feature is robust before moving to the next phase. The integration with existing build processes ensures backward compatibility while adding powerful new capabilities.

## Next Steps

1. **Review and refine** this proposal
2. **Create detailed technical specifications** for Phase 1
3. **Implement basic image support** as a proof of concept
4. **Gather feedback** from users and contributors
5. **Iterate and expand** based on real-world usage
