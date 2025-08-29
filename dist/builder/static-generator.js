import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { buildNavigationTree, validateContentStructure } from './parser.js';
import { generateStaticPages } from './builder.js';
export class StaticGeneratorError extends Error {
    constructor(message, filePath) {
        super(message);
        this.filePath = filePath;
        this.name = 'StaticGeneratorError';
    }
}
export async function generateStaticSite(contentPath, outputPath, options = {}) {
    try {
        // Validate content structure
        validateContentStructure(contentPath);
        // Build navigation tree
        const navigation = buildNavigationTree(contentPath);
        // Generate static pages
        const pages = generateStaticPages(navigation, contentPath, {
            processor: options.processor,
            pageOptions: {
                title: options.title,
                baseUrl: options.baseUrl,
                css: options.css,
                js: options.js
            }
        });
        // Create output directory
        mkdirSync(outputPath, { recursive: true });
        // Write pages
        for (const page of pages) {
            const pageOutputPath = join(outputPath, page.path);
            mkdirSync(dirname(pageOutputPath), { recursive: true });
            writeFileSync(pageOutputPath, page.html);
        }
        // Generate index page if requested
        let index;
        if (options.includeIndex !== false) {
            const indexPage = generateIndexPage(navigation, options);
            const indexPath = join(outputPath, 'index.html');
            writeFileSync(indexPath, indexPage.html);
            index = { ...indexPage, path: 'index.html' };
        }
        return {
            pages,
            index: index || undefined
        };
    }
    catch (error) {
        if (error instanceof StaticGeneratorError) {
            throw error;
        }
        throw new StaticGeneratorError(`Static site generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, contentPath);
    }
}
function generateIndexPage(navigation, options) {
    const title = options.indexTitle || options.title || 'Documentation';
    const baseUrl = options.baseUrl || '';
    const css = options.css || '';
    const js = options.js || '';
    const navigationHtml = generateNavigationHtml(navigation.items);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <base href="${baseUrl}">
    ${css ? `<style>${css}</style>` : ''}
</head>
<body>
    <div class="container">
        <header>
            <h1>${title}</h1>
        </header>
        <nav class="navigation">
            ${navigationHtml}
        </nav>
        <main class="content">
            <p>Welcome to the documentation. Please select a page from the navigation.</p>
        </main>
    </div>
    ${js ? `<script>${js}</script>` : ''}
</body>
</html>`;
    return { html };
}
function generateNavigationHtml(items) {
    let html = '<ul class="nav-list">';
    for (const item of items) {
        html += '<li class="nav-item">';
        if (item.type === 'page' && item.path) {
            const href = item.path.replace(/\.md$/, '.html');
            html += `<a href="${href}" class="nav-link">${item.label}</a>`;
        }
        else {
            html += `<span class="nav-section">${item.label}</span>`;
        }
        if (item.items && item.items.length > 0) {
            html += generateNavigationHtml(item.items);
        }
        html += '</li>';
    }
    html += '</ul>';
    return html;
}
export function generateSitemap(pages, baseUrl) {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => {
        const url = `${baseUrl}/${page.path}`;
        return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`;
    }).join('\n')}
</urlset>`;
    return sitemap;
}
export function generateRobotsTxt(baseUrl) {
    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
}
//# sourceMappingURL=static-generator.js.map