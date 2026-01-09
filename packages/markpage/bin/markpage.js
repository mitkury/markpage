#!/usr/bin/env node

import { buildPages } from '../dist/builder/index.js';

const args = process.argv.slice(2);
const command = args[0];

function hasFlag(name) {
  return args.includes(name);
}

async function main() {
  try {
    switch (command) {
      case 'build':
        await handleBuild();
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
  const checkLinks = hasFlag('--check-links');
  const warnUnindexed = hasFlag('--warn-unindexed-links');
  const failOnBrokenLinks = hasFlag('--fail-on-broken-links');
  
  if (!contentPath) {
    console.error('Error: Content path is required');
    console.error('Usage: markpage build <content-path> --output <output-path>');
    process.exit(1);
  }
  
  console.log(`Building documentation from ${contentPath}...`);
  
  const result = await buildPages(contentPath, {
    appOutput: outputPath,
    websiteOutput: outputPath,
    includeContent: true,
    linkCheck: checkLinks
      ? {
          warnOnUnindexed: warnUnindexed,
          failOnBroken: failOnBrokenLinks
        }
      : false
  });
  
  console.log(`✓ Built ${Object.keys(result.content || {}).length} pages`);
  console.log(`✓ Output written to ${outputPath}`);

  if (result.linkCheck) {
    const { issues, warnings, filesChecked } = result.linkCheck;
    if (issues.length === 0 && warnings.length === 0) {
      console.log(`✓ Link check: checked ${filesChecked} file(s), no issues found`);
      return;
    }
    if (issues.length > 0) {
      console.warn(`⚠ Link check: ${issues.length} issue(s) found`);
      for (const issue of issues) {
        console.warn(`  - ${issue.file} -> ${issue.target} (${issue.reason})`);
      }
    }
    if (warnings.length > 0) {
      console.warn(`⚠ Link check: ${warnings.length} warning(s) found`);
      for (const w of warnings) {
        console.warn(`  - ${w.file} -> ${w.target} (${w.reason})`);
      }
    }
  }
}


function showHelp() {
  console.log(`
Markpage CLI

Usage:
  markpage <command> [options]

Commands:
  build <content-path> --output <output-path>  Build documentation for app/website
  --help, -h                                   Show this help message

Build options:
  --check-links                                Check internal markdown links (local files) during build
  --fail-on-broken-links                       Exit with code 1 if any broken links are found (requires --check-links)
  --warn-unindexed-links                       Warn when a link points to an existing markdown file not present in navigation (requires --check-links)

Examples:
  markpage build ./docs --output ./src/lib/content
  markpage build ./blog --output ./src/blog
  markpage build ./docs --output ./src/lib/content --check-links --fail-on-broken-links
`);
}

main();