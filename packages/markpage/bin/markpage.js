#!/usr/bin/env node

import { buildPages, generateStaticSite } from '../dist/builder/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'build':
        await handleBuild();
        break;
      case 'static':
        await handleStatic();
        break;
      case '--help':
      case '-h':
        showHelp();
        break;
      default:
        console.error('Unknown command. Use --help for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function handleBuild() {
  const contentPath = args[1];
  const outputPath = args[3] || './dist/content';
  
  if (!contentPath) {
    console.error('Error: Content path is required');
    console.error('Usage: markpage build <content-path> --output <output-path>');
    process.exit(1);
  }
  
  console.log(`Building documentation from ${contentPath}...`);
  
  const result = await buildPages(contentPath, {
    appOutput: outputPath,
    websiteOutput: outputPath,
    includeContent: true
  });
  
  console.log(`✓ Built ${Object.keys(result.content || {}).length} pages`);
  console.log(`✓ Output written to ${outputPath}`);
}

async function handleStatic() {
  const contentPath = args[1];
  const outputPath = args[3] || './dist/static';
  
  if (!contentPath) {
    console.error('Error: Content path is required');
    console.error('Usage: markpage static <content-path> --output <output-path>');
    process.exit(1);
  }
  
  console.log(`Generating static site from ${contentPath}...`);
  
  const result = await generateStaticSite(contentPath, outputPath, {
    title: 'Documentation',
    includeIndex: true
  });
  
  console.log(`✓ Generated ${result.pages.length} static pages`);
  console.log(`✓ Output written to ${outputPath}`);
}

function showHelp() {
  console.log(`
Markpage CLI

Usage:
  markpage <command> [options]

Commands:
  build <content-path> --output <output-path>  Build documentation for app/website
  static <content-path> --output <output-path> Generate static HTML site
  --help, -h                                   Show this help message

Examples:
  markpage build ./docs --output ./src/lib/content
  markpage static ./docs --output ./dist
  markpage build ./blog --output ./src/blog
`);
}

main();