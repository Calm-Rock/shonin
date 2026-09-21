'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export type DocsNavItem = { id: string; label: string };

export function DocsShell({ nav, children }: { nav: DocsNavItem[]; children: React.ReactNode }) {
  const [active, setActive] = useState(nav[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const canWriteHash = useRef(false);

  // Highlight the section you are reading and keep the URL hash in step with it.
  useEffect(() => {
    // Wait for the browser to finish jumping to a deep-linked section before rewriting the hash.
    const ready = window.setTimeout(() => {
      canWriteHash.current = true;
    }, 600);

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = nav[0]?.id ?? '';
      for (const { id } of nav) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      // The last section may never reach the top of a short page.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = nav[nav.length - 1]?.id ?? current;
      }
      setActive(current);
      if (canWriteHash.current && window.location.hash !== `#${current}`) {
        window.history.replaceState(null, '', `#${current}`);
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.clearTimeout(ready);
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [nav]);

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
    setMobileOpen(false);
  }

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen" style={{ scrollBehavior: 'smooth' }}>
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/[0.06] h-14 flex items-center px-6 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Shonin" width={24} height={24} />
          <span className="font-semibold text-white">shonin</span>
        </Link>
        <div className="flex items-center gap-5">
          <button
            className="sm:hidden text-[#888] hover:text-white"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="hidden sm:flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-[#888] hover:text-white transition-colors">
              Dashboard
            </a>
            <a
              href="/signup"
              className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors"
            >
              Try the demo
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex relative">
        <aside
          className={`
            fixed sm:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-56 shrink-0
            border-r border-white/[0.06] bg-[#0a0a0a] overflow-y-auto
            transition-transform duration-200
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
          `}
        >
          <nav className="px-4 py-8 flex flex-col gap-0.5">
            <p className="text-[10px] font-semibold text-[#444] uppercase tracking-widest mb-3 px-2">API Reference</p>
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(item.id);
                }}
                className={`text-left w-full text-sm px-2 py-1.5 rounded-md transition-colors ${
                  active === item.id
                    ? 'text-white bg-white/[0.07]'
                    : 'text-[#666] hover:text-[#bbb] hover:bg-white/[0.03]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 sm:hidden" onClick={() => setMobileOpen(false)} />}

        <main className="flex-1 min-w-0 px-6 sm:px-12 py-12 space-y-20">{children}</main>
      </div>
    </div>
  );
}
