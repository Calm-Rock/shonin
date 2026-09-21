import fs from 'node:fs';
import path from 'node:path';

export type Doc = {
  slug: string;
  title: string;
  order: number;
  badge?: 'GET' | 'POST';
  endpoint?: string;
  description: string;
  body: string;
};

const docsDir = path.join(process.cwd(), 'content', 'docs');

function parseDoc(slug: string, raw: string): Doc {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Doc "${slug}" is missing its frontmatter`);

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon > 0) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }

  return {
    slug,
    title: meta.title,
    order: Number(meta.order),
    badge: meta.badge === 'GET' || meta.badge === 'POST' ? meta.badge : undefined,
    endpoint: meta.endpoint || undefined,
    description: meta.description ?? '',
    body: match[2].trim(),
  };
}

export function listDocs(): Doc[] {
  return fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => parseDoc(file.replace(/\.md$/, ''), fs.readFileSync(path.join(docsDir, file), 'utf8')))
    .sort((a, b) => a.order - b.order);
}

export function getDoc(slug: string): Doc | undefined {
  return listDocs().find((doc) => doc.slug === slug);
}

export function docAsMarkdown(doc: Doc): string {
  const endpoint = doc.badge && doc.endpoint ? `\n\n\`${doc.badge} ${doc.endpoint}\`` : '';
  return `# ${doc.title}${endpoint}\n\n${doc.body}\n`;
}

// llms.txt follows https://llmstxt.org: a title, a summary, and links to markdown pages.
export function buildLlmsTxt(docs: Doc[], baseUrl: string, githubUrl: string): string {
  const pages = docs.map((doc) => `- [${doc.title}](${baseUrl}/docs/${doc.slug}.md): ${doc.description}`).join('\n');
  return `# Shonin

> Open source, human-in-the-loop approval API for AI agents and automations. One API call emails an approver Approve and Reject buttons; your code polls for the decision or receives a webhook. MIT licensed and self-hostable.

The API base URL is ${baseUrl}/api/v1 and every request needs an Authorization: Bearer API key. The hosted app at ${baseUrl} is a capped demo for trying Shonin out; for real use, self-host it.

## Docs

${pages}

## Source

- [GitHub repository](${githubUrl}): source code, MIT license, and the self-hosting guide in the README
- [README as markdown](${githubUrl.replace('github.com', 'raw.githubusercontent.com')}/main/README.md): setup and API summary

## Optional

- [All docs in one file](${baseUrl}/llms-full.txt)
`;
}

export function buildLlmsFull(docs: Doc[], baseUrl: string): string {
  return `# Shonin documentation\n\nBase URL: ${baseUrl}/api/v1\n\n${docs.map(docAsMarkdown).join('\n---\n\n')}`;
}
