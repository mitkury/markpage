import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { buildPages } from 'markpage/builder';

describe('Builder link checking', () => {
  let tempDir: string;
  let docsDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `markpage-linkcheck-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    docsDir = join(tempDir, 'docs');
    mkdirSync(docsDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.warn('Failed to clean up temp directory:', tempDir, error);
      }
    }
  });

  it('reports missing local files and ignores external links', async () => {
    writeFileSync(
      join(docsDir, '.index.json'),
      JSON.stringify({
        items: [{ name: 'a', type: 'page', label: 'A' }],
      })
    );

    writeFileSync(
      join(docsDir, 'a.md'),
      [
        '# A',
        '',
        '[ok](./existing.md)',
        '[missing](./nope.md)',
        '[external](https://example.com)',
        '[proto-relative](//example.com)',
        '[mailto](mailto:test@example.com)',
        '[site-absolute](/docs/route)',
      ].join('\n')
    );

    writeFileSync(join(docsDir, 'existing.md'), '# Existing');

    const result = await buildPages(docsDir, { includeContent: false, linkCheck: true });
    expect(result.linkCheck).toBeDefined();
    expect(result.linkCheck!.issues).toHaveLength(1);
    expect(result.linkCheck!.issues[0]!.reason).toBe('missing file');
    expect(result.linkCheck!.issues[0]!.target).toContain('./nope.md');
  });

  it('detects broken links across common markdown link forms', async () => {
    writeFileSync(
      join(docsDir, '.index.json'),
      JSON.stringify({
        items: [{ name: 'a', type: 'page', label: 'A' }],
      })
    );

    // Covers:
    // - inline links
    // - reference links [text][id]
    // - collapsed references [text][]
    // - angle-bracket targets
    // - images
    // - links inside lists/tables
    writeFileSync(
      join(docsDir, 'a.md'),
      [
        '# A',
        '',
        'Inline missing: [x](./missing-inline.md)',
        'Ref missing: [x][ref-miss]',
        'Collapsed missing: [collapsed][]',
        'Angle missing: [x](<./missing-angle.md>)',
        'Image missing: ![alt](./missing.png)',
        '',
        '- List missing: [li](./missing-list.md)',
        '',
        '| Col |',
        '| --- |',
        '| [tbl](./missing-table.md) |',
        '',
        '[ref-miss]: ./missing-ref.md',
        '[collapsed]: ./missing-collapsed.md',
      ].join('\n')
    );

    const result = await buildPages(docsDir, { includeContent: false, linkCheck: true });
    expect(result.linkCheck).toBeDefined();

    const targets = result.linkCheck!.issues.map((i) => i.target);
    // We expect exactly these 7 missing targets (all local paths).
    expect(targets).toEqual(
      expect.arrayContaining([
        './missing-inline.md',
        './missing-ref.md',
        './missing-collapsed.md',
        './missing-angle.md',
        './missing.png',
        './missing-list.md',
        './missing-table.md',
      ])
    );

    // Ensure all are reported as missing files (not protocol errors).
    expect(new Set(result.linkCheck!.issues.map((i) => i.reason))).toEqual(new Set(['missing file']));
  });

  it('can warn when a link points to a markdown file not present in navigation', async () => {
    writeFileSync(
      join(docsDir, '.index.json'),
      JSON.stringify({
        items: [{ name: 'a', type: 'page', label: 'A' }],
      })
    );

    writeFileSync(join(docsDir, 'a.md'), '[link](./b.md)');
    writeFileSync(join(docsDir, 'b.md'), '# B (exists but not indexed)');

    const result = await buildPages(docsDir, {
      includeContent: false,
      linkCheck: { warnOnUnindexed: true },
    });

    expect(result.linkCheck).toBeDefined();
    expect(result.linkCheck!.issues).toHaveLength(0);
    expect(result.linkCheck!.warnings).toHaveLength(1);
    expect(result.linkCheck!.warnings[0]!.reason).toBe('not in navigation');
    expect(result.linkCheck!.warnings[0]!.resolvedFile.endsWith('b.md')).toBe(true);
  });

  it('can fail the build when failOnBroken is enabled', async () => {
    writeFileSync(
      join(docsDir, '.index.json'),
      JSON.stringify({
        items: [{ name: 'a', type: 'page', label: 'A' }],
      })
    );
    writeFileSync(join(docsDir, 'a.md'), '[missing](./nope.md)');

    await expect(
      buildPages(docsDir, { includeContent: false, linkCheck: { failOnBroken: true } })
    ).rejects.toThrow(/Link check failed/i);
  });
});

