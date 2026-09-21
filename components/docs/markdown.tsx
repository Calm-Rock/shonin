import React, { isValidElement } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

// Removes the [!NOTE] or [!WARNING] marker that starts a callout, wherever the first text sits in the tree.
function stripMarker(node: React.ReactNode): React.ReactNode {
  let done = false;
  const walk = (n: React.ReactNode): React.ReactNode => {
    if (done) return n;
    if (typeof n === 'string') {
      if (!n.trim()) return n;
      done = true;
      return n.replace(/^\s*\[!(NOTE|WARNING)\]\s*/, '');
    }
    if (Array.isArray(n)) return n.map(walk);
    if (isValidElement<{ children?: React.ReactNode }>(n)) {
      return React.cloneElement(n, undefined, walk(n.props.children));
    }
    return n;
  };
  return walk(node);
}

const statusColor: Record<string, string> = { '400': 'text-yellow-400', '401': 'text-red-400', '404': 'text-orange-400' };

const components: Components = {
  p: ({ children }) => <p className="text-[#888] leading-relaxed">{children}</p>,
  h2: ({ children }) => <h3 className="text-sm font-semibold text-white mt-8 mb-3">{children}</h3>,
  h3: ({ children }) => <h4 className="text-sm font-semibold text-white mt-6 mb-2">{children}</h4>,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-2 text-sm text-[#888] leading-relaxed marker:text-[#555]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-3 text-[#888] leading-relaxed marker:text-[#555]">{children}</ol>
  ),
  li: ({ children }) => <li className="[&>div]:mt-3">{children}</li>,
  a: ({ href = '', children }) => {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  },
  code: ({ children }) => (
    <code className="text-[13px] font-mono bg-white/[0.06] text-[#ccc] px-1.5 py-0.5 rounded">{children}</code>
  ),
  pre: ({ children }) => {
    const code = React.Children.only(children) as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
    const lang = /language-(\w+)/.exec(code.props.className ?? '')?.[1] ?? 'text';
    return <CodeBlock lang={lang} code={textOf(code.props.children).replace(/\n$/, '')} />;
  },
  blockquote: ({ children }) => {
    const kind = /^\[!(NOTE|WARNING)\]/.exec(textOf(children).trim())?.[1];
    const warn = kind === 'WARNING';
    return (
      <div
        className={`rounded-lg px-4 py-3.5 text-sm leading-relaxed border [&_p]:text-inherit [&_p]:m-0 [&_strong]:text-white ${
          warn
            ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-200/70'
            : 'bg-white/[0.03] border-white/[0.08] text-[#888]'
        }`}
      >
        {stripMarker(children)}
      </div>
    );
  },
  table: ({ children }) => (
    <div className="rounded-lg border border-white/[0.06] overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-white/[0.06] bg-[#111]">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-white/[0.04]">{children}</tbody>,
  th: ({ children }) => (
    <th className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">{children}</th>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-white/[0.02] transition-colors">
      {React.Children.map(children, (child, col) =>
        isValidElement(child) ? React.cloneElement(child as React.ReactElement<{ col?: number }>, { col }) : child
      )}
    </tr>
  ),
  td: ({ children, ...props }) => {
    const col = (props as { col?: number }).col ?? 0;
    const text = textOf(children).trim();

    if (text === 'required') {
      return (
        <td className="px-4 py-3">
          <span className="text-[10px] font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
            required
          </span>
        </td>
      );
    }
    if (text === 'optional') {
      return (
        <td className="px-4 py-3">
          <span className="text-[10px] font-semibold text-[#555] bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
            optional
          </span>
        </td>
      );
    }
    if (col === 0) {
      const color = statusColor[text] ?? (/^\d{3}$/.test(text) ? 'text-[#82aaff]' : 'text-[#82aaff]');
      return (
        <td className={`px-4 py-3 align-top font-mono text-[13px] ${color} [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit`}>
          {children}
        </td>
      );
    }
    if (col === 1) {
      return (
        <td className="px-4 py-3 align-top text-[#ccc] [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-[#c792ea]">
          {children}
        </td>
      );
    }
    return <td className="px-4 py-3 align-top text-[#666] leading-relaxed">{children}</td>;
  },
};

export function Markdown({ source }: { source: string }) {
  return (
    <div className="space-y-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
