import fs from 'fs';
import path from 'path';
import { Lexer, type Token, type TokensList } from 'marked';
import type { NavigationItem, LinkCheckResult, LinkIssue, LinkCheckBuildOptions, LinkWarning } from '../types.js';

const EXTERNAL_PROTOCOL = /^(https?:|mailto:|tel:|data:|ftp:)/i;

function parseLinkTarget(raw: string): string {
  let target = raw.trim();
  // Marked may surface <...> around autolinks; normalize that away
  if (target.startsWith('<') && target.endsWith('>')) {
    target = target.slice(1, -1);
  }
  // Drop anything after whitespace (common in malformed links)
  if (target.includes(' ')) {
    target = target.split(/\s+/)[0] ?? target;
  }
  return target;
}

function resolveToFileOrMarkdownVariants(resolvedPath: string): string | null {
  // If it's already a file, use it.
  if (fs.existsSync(resolvedPath)) {
    const stat = fs.statSync(resolvedPath);
    if (stat.isFile()) return resolvedPath;
    if (stat.isDirectory()) {
      // For directories, prefer index.md then README.md
      const indexMd = path.join(resolvedPath, 'index.md');
      if (fs.existsSync(indexMd) && fs.statSync(indexMd).isFile()) return indexMd;
      const readme = path.join(resolvedPath, 'README.md');
      if (fs.existsSync(readme) && fs.statSync(readme).isFile()) return readme;
      const readmeLower = path.join(resolvedPath, 'readme.md');
      if (fs.existsSync(readmeLower) && fs.statSync(readmeLower).isFile()) return readmeLower;
      return null;
    }
  }

  // Try markdown variants for extension-less references.
  const withMd = `${resolvedPath}.md`;
  if (fs.existsSync(withMd) && fs.statSync(withMd).isFile()) return withMd;

  const asReadme = path.join(resolvedPath, 'README.md');
  if (fs.existsSync(asReadme) && fs.statSync(asReadme).isFile()) return asReadme;

  const asIndex = path.join(resolvedPath, 'index.md');
  if (fs.existsSync(asIndex) && fs.statSync(asIndex).isFile()) return asIndex;

  return null;
}

function isExternalLink(target: string): boolean {
  // Also treat protocol-relative URLs like `//example.com` as external.
  return EXTERNAL_PROTOCOL.test(target) || target.startsWith('//');
}

function isSiteAbsolute(target: string): boolean {
  // `/foo/bar` is usually a website route, not a filesystem path. We ignore these by default.
  return target.startsWith('/') && !target.startsWith('//');
}

function collectNavigationMarkdownFiles(docsRoot: string, navigation: NavigationItem[]): Set<string> {
  const out = new Set<string>();
  const rootAbs = path.resolve(docsRoot);

  function visit(items: NavigationItem[]) {
    for (const item of items) {
      if (item.path) {
        out.add(path.resolve(rootAbs, item.path));
      }
      if (item.items) visit(item.items);
    }
  }

  visit(navigation);
  return out;
}

function walkMarkedTokens(tokens: Token[] | TokensList, visit: (token: any) => void): void {
  for (const token of tokens as any[]) {
    if (!token || typeof token !== 'object') continue;
    visit(token);

    // Common child token containers in marked
    if (Array.isArray(token.tokens)) walkMarkedTokens(token.tokens, visit);
    if (Array.isArray(token.items)) walkMarkedTokens(token.items, visit);

    // Table tokens have nested tokens arrays under header/rows cells
    if (Array.isArray(token.header)) {
      for (const cell of token.header) {
        if (cell?.tokens) walkMarkedTokens(cell.tokens, visit);
      }
    }
    if (Array.isArray(token.rows)) {
      for (const row of token.rows) {
        for (const cell of row ?? []) {
          if (cell?.tokens) walkMarkedTokens(cell.tokens, visit);
        }
      }
    }
  }
}

function extractLinkTargetsFromMarkdown(markdown: string): string[] {
  const tokens = Lexer.lex(markdown);
  const targets: string[] = [];

  walkMarkedTokens(tokens, (token) => {
    if (token.type === 'link' && typeof token.href === 'string') {
      targets.push(token.href);
    }
    if (token.type === 'image' && typeof token.href === 'string') {
      targets.push(token.href);
    }
  });

  return targets;
}

export function checkMarkdownLinksForNavigation(
  docsRoot: string,
  navigation: NavigationItem[],
  options: Pick<LinkCheckBuildOptions, 'warnOnUnindexed'> = {}
): LinkCheckResult {
  const rootAbs = path.resolve(docsRoot);
  const navFiles = collectNavigationMarkdownFiles(rootAbs, navigation);

  const issues: LinkIssue[] = [];
  const warnings: LinkWarning[] = [];

  const files = [...navFiles];

  for (const fileAbs of files) {
    let markdown: string;
    try {
      markdown = fs.readFileSync(fileAbs, 'utf8');
    } catch {
      // If a nav file can't be read, builder validation will already fail elsewhere.
      continue;
    }

    const targets = extractLinkTargetsFromMarkdown(markdown);
    for (const rawTarget of targets) {
      const target = parseLinkTarget(rawTarget);
      if (!target) continue;
      if (isExternalLink(target)) continue;
      if (isSiteAbsolute(target)) continue;

      // Anchor-only links are allowed and are intentionally not validated right now.
      // Markpage renderers don't currently standardize heading IDs, so validating
      // `#some-heading` would create noisy false positives.
      if (target.startsWith('#')) continue;

      const [pathPartRaw] = target.split('#');
      const pathPart = pathPartRaw ?? '';
      if (!pathPart) continue;

      // Prevent weird protocols like `file:` or `javascript:` from being treated as local paths.
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(pathPart)) {
        issues.push({ file: fileAbs, target, reason: 'unsupported protocol' });
        continue;
      }

      const resolvedPath = path.resolve(path.dirname(fileAbs), pathPart);
      const resolvedFile = resolveToFileOrMarkdownVariants(resolvedPath);
      if (!resolvedFile) {
        issues.push({ file: fileAbs, target, reason: 'missing file' });
        continue;
      }

      if (options.warnOnUnindexed) {
        const normalized = path.resolve(resolvedFile);
        const withinDocs = normalized === rootAbs || normalized.startsWith(`${rootAbs}${path.sep}`);
        if (withinDocs && normalized.endsWith('.md') && !navFiles.has(normalized)) {
          warnings.push({
            file: fileAbs,
            target,
            resolvedFile: normalized,
            reason: 'not in navigation',
          });
        }
      }

      // Anchor checking for target files is intentionally skipped for now (see comment above).
    }
  }

  return { filesChecked: files.length, issues, warnings };
}

