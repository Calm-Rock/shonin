import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';
import { Markdown } from '@/components/docs/markdown';
import { listDocs } from '@/lib/docs';

export const metadata: Metadata = {
  title: 'Shonin Docs',
  description: 'API reference, webhooks, risk levels and self-hosting for Shonin, the open source human approval API.',
};

export default function DocsPage() {
  const docs = listDocs();

  return (
    <DocsShell nav={docs.map((doc) => ({ id: doc.slug, label: doc.title }))}>
      {docs.map((doc) => (
        <section key={doc.slug} id={doc.slug} className="scroll-mt-20">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">{doc.title}</h2>
            {doc.badge && (
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md font-mono ${
                  doc.badge === 'GET'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
              >
                {doc.badge}
              </span>
            )}
            {doc.endpoint && (
              <code className="text-sm text-[#888] font-mono bg-white/[0.04] px-2.5 py-0.5 rounded-md border border-white/[0.06]">
                {doc.endpoint}
              </code>
            )}
            <a
              href={`/docs/${doc.slug}.md`}
              className="ml-auto text-xs font-mono text-[#555] hover:text-[#aaa] transition-colors"
            >
              Markdown
            </a>
          </div>
          <Markdown source={doc.body} />
        </section>
      ))}
    </DocsShell>
  );
}
