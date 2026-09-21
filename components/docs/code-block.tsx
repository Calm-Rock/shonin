'use client';

import { useRef, useState } from 'react';

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group relative rounded-xl bg-[#0d0d0d] border border-white/[0.08] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#111]">
        <span className="text-[10px] font-semibold text-[#444] uppercase tracking-widest">{lang}</span>
        <button
          onClick={copy}
          className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="px-5 py-4 text-sm font-mono text-[#ccc] leading-7 overflow-x-auto">
        <HighlightedCode code={code} lang={lang} />
      </pre>
    </div>
  );
}

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  if (lang === 'json') return <span dangerouslySetInnerHTML={{ __html: highlightJson(code) }} />;
  if (lang === 'bash') return <span dangerouslySetInnerHTML={{ __html: highlightBash(code) }} />;
  return <span>{code}</span>;
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightJson(raw: string): string {
  return esc(raw)
    .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span style="color:#f07178">$1</span>$2')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#c3e88d">$1</span>')
    .replace(/\b(true|false|null)\b/g, '<span style="color:#c792ea">$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#f78c6c">$1</span>');
}

function highlightBash(raw: string): string {
  return esc(raw)
    .replace(/^(curl)/gm, '<span style="color:#82aaff">$1</span>')
    .replace(/(-[A-Za-z]+)/g, '<span style="color:#c792ea">$1</span>')
    .replace(/(https?:\/\/[^\s\\'"]+)/g, '<span style="color:#c3e88d">$1</span>')
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#c3e88d">$1</span>');
}
