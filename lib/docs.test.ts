import { describe, it, expect } from 'vitest';
import { buildLlmsFull, buildLlmsTxt, docAsMarkdown, getDoc, listDocs } from './docs';

const docs = listDocs();

describe('docs content', () => {
  it('has unique slugs and orders, and every page has a title and description', () => {
    expect(new Set(docs.map((d) => d.slug)).size).toBe(docs.length);
    expect(new Set(docs.map((d) => d.order)).size).toBe(docs.length);
    for (const doc of docs) {
      expect(doc.title).toBeTruthy();
      expect(doc.description).toBeTruthy();
      expect(doc.body.length).toBeGreaterThan(0);
    }
  });

  it('gives an endpoint to every page that has a method badge, and vice versa', () => {
    for (const doc of docs) {
      expect(Boolean(doc.badge)).toBe(Boolean(doc.endpoint));
    }
  });

  it('only links to sections that exist inside the docs', () => {
    const slugs = new Set(docs.map((d) => d.slug));
    for (const doc of docs) {
      for (const match of doc.body.matchAll(/\]\(#([a-z0-9-]+)\)/g)) {
        expect(slugs.has(match[1]), `${doc.slug} links to #${match[1]}`).toBe(true);
      }
    }
  });

  it('never shows tokens as returned by the API', () => {
    for (const doc of docs) {
      expect(doc.body).not.toMatch(/"(approve|reject)_token"/);
    }
  });
});

describe('docs as markdown', () => {
  it('finds a page by slug and renders it with its heading and endpoint', () => {
    const doc = getDoc('create-approval');
    expect(doc).toBeDefined();
    const md = docAsMarkdown(doc!);
    expect(md.startsWith('# Create Approval')).toBe(true);
    expect(md).toContain('`POST /v1/approvals`');
    expect(getDoc('nope')).toBeUndefined();
  });
});

describe('llms.txt', () => {
  const txt = buildLlmsTxt(docs, 'https://example.com', 'https://github.com/acme/shonin');

  it('follows the llms.txt shape: a title, a summary quote, and sections', () => {
    expect(txt.startsWith('# Shonin\n')).toBe(true);
    expect(txt).toContain('\n> ');
    expect(txt).toContain('## Docs');
    expect(txt).toContain('## Source');
  });

  it('links every docs page as markdown', () => {
    for (const doc of docs) {
      expect(txt).toContain(`(https://example.com/docs/${doc.slug}.md)`);
    }
  });

  it('points to the raw README and the full-docs file', () => {
    expect(txt).toContain('https://raw.githubusercontent.com/acme/shonin/main/README.md');
    expect(txt).toContain('https://example.com/llms-full.txt');
  });

  it('builds a full file containing every page', () => {
    const full = buildLlmsFull(docs, 'https://example.com');
    for (const doc of docs) expect(full).toContain(`# ${doc.title}`);
  });
});
