# Installation Guide

This guide covers the installation process for the package.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Step 1: Install the Package

```bash
npm install markpage
```

## Step 2: Create Content Structure

Create your content directory with the following structure:

```
my-content/
├── .index.json
├── getting-started.md
└── guides/
    ├── .index.json
    └── installation.md
```

## Step 3: Build Documentation

```bash
npx markpage build ./my-content --output ./src/lib/content
```

## Verification

Check that the build output contains:
- `navigation.json` - Navigation structure
- `content.json` - Markdown content bundle