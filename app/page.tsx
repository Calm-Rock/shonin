import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      <Nav />
      <Hero />
      <CodeSection />
      <HowItWorks />
      <Footer />
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Shonin" width={24} height={24} />
          <span className="font-semibold text-white">shonin</span>
        </div>
        <nav className="flex items-center gap-5">
          <a href="/docs" className="text-sm text-[#888] hover:text-white transition-colors">
            Docs
          </a>
          <a href="/dashboard" className="text-sm text-[#888] hover:text-white transition-colors">
            Dashboard
          </a>
          <a
            href="/signup"
            className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors"
          >
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-[#888]">Now in beta</span>
      </div>

      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mb-6">
        Human approval,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
          delivered to any inbox.
        </span>
      </h1>

      <p className="text-lg text-[#888] max-w-xl leading-relaxed mb-10">
        Add a human checkpoint to any automation, AI agent, or script in minutes.
        One API call sends the approval email. Your code waits for the decision.
      </p>

      <div className="flex items-center gap-3 mb-16">
        <a
          href="/signup"
          className="bg-white text-black font-medium text-sm px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Get Started
        </a>
        <a
          href="/docs"
          className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1.5"
        >
          View Docs
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Mock email preview */}
      <MockEmail />
    </section>
  );
}

function MockEmail() {
  return (
    <div className="w-full max-w-lg">
      {/* Browser/client chrome */}
      <div className="bg-[#161616] rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/60">
        {/* Window chrome */}
        <div className="border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 bg-[#1f1f1f] rounded-md px-3 py-1 text-xs text-[#555] text-center">
            mail.google.com
          </div>
        </div>

        {/* Inbox list item */}
        <div className="border-b border-white/[0.06] px-4 py-3 flex items-start gap-3 bg-white/[0.03]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
            S
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-white">approvals@shonin.dev</span>
              <span className="text-xs text-[#555]">just now</span>
            </div>
            <p className="text-xs font-medium text-[#ccc] truncate">⚠️ DESTRUCTIVE — git push origin main --force</p>
            <p className="text-xs text-[#555] truncate">Will overwrite upstream commits · Approve or reject…</p>
          </div>
        </div>

        {/* Email body */}
        <div className="bg-white">
          {/* Risk banner */}
          <div className="bg-[#fef2f2] border-b border-[#fecaca] px-5 py-3">
            <p className="text-[11px] font-bold text-[#b91c1c]">DESTRUCTIVE · This action cannot be undone</p>
            <ul className="mt-1.5 space-y-0.5">
              <li className="text-[10px] text-[#b91c1c]">• Will overwrite upstream commits</li>
              <li className="text-[10px] text-[#b91c1c]">• Bypasses branch protection rules</li>
            </ul>
          </div>

          <div className="px-5 py-4">
            {/* Command */}
            <p className="text-[9px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-1">Command</p>
            <p className="text-sm font-bold text-[#111827] mb-3 leading-tight">git push origin main --force</p>

            {/* Why */}
            <div className="bg-[#f9fafb] rounded-md p-2.5 mb-3">
              <p className="text-[9px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-1">Why Claude wants this</p>
              <p className="text-[10px] text-[#6b7280]">The remote has diverged after a rebase. Force push is needed to sync the branch.</p>
            </div>

            {/* Files */}
            <div className="mb-3">
              <p className="text-[9px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-1.5">Files (2)</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#facc15] shrink-0" />
                  <span className="text-[10px] font-mono text-[#374151]">app/api/deploy/route.ts</span>
                  <span className="text-[9px] text-[#b45309] font-bold">MODIFIED</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shrink-0" />
                  <span className="text-[10px] font-mono text-[#374151]">scripts/force-deploy.sh</span>
                  <span className="text-[9px] text-[#15803d] font-bold">NEW</span>
                </div>
              </div>
            </div>

            {/* Diff preview */}
            <div className="bg-[#1a1a1a] rounded-md p-2.5 mb-4 overflow-hidden">
              <p className="text-[9px] font-mono text-[#4ade80]">+ export async function POST(req) &#123;</p>
              <p className="text-[9px] font-mono text-[#4ade80]">+   await deploy(&#123; force: true &#125;)</p>
              <p className="text-[9px] font-mono text-[#f87171]">- // force deploy disabled</p>
              <p className="text-[9px] font-mono text-[#6b7280] mt-1">… View full diff →</p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex-1 bg-[#16a34a] text-white text-xs font-semibold py-2 rounded-md cursor-default">
                Approve
              </button>
              <span className="text-xs text-[#dc2626] font-semibold underline cursor-default">Reject</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Code Section ────────────────────────────────────────────────────── */
function CodeSection() {
  return (
    <section className="bg-[#080808] border-y border-white/[0.06] py-24">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-semibold text-[#555] uppercase tracking-widest text-center mb-3">
          Developer first
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">
          Integrate in minutes
        </h2>

        {/* Code block */}
        <div className="bg-[#0d0d0d] rounded-xl border border-white/[0.08] overflow-hidden shadow-xl shadow-black/40">
          {/* Editor chrome */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#111]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs text-[#444]">deploy.ts</span>
            <span className="text-xs text-[#444]">TypeScript</span>
          </div>
          {/* Code */}
          <pre className="px-6 py-6 text-sm leading-7 overflow-x-auto font-mono">
            <code>
              <Line>
                <Kw>const</Kw> <Var>approval</Var> <Op>=</Op> <Kw>await</Kw> <Var>shonin</Var><Op>.</Op><Fn>request</Fn><Op>({"{"}</Op>
              </Line>
              <Line indent={1}>
                <Prop>action</Prop><Op>:</Op> <Str>&quot;Deploy to production&quot;</Str><Op>,</Op>
              </Line>
              <Line indent={1}>
                <Prop>approver</Prop><Op>:</Op> <Str>&quot;cto@company.com&quot;</Str><Op>,</Op>
              </Line>
              <Line indent={1}>
                <Prop>context</Prop><Op>:</Op> <Str>&quot;PR #247 merged, 3 files changed&quot;</Str>
              </Line>
              <Line>
                <Op>{"}"}</Op><Op>)</Op>
              </Line>
              <Line>&nbsp;</Line>
              <Line>
                <Kw>if</Kw> <Op>(</Op><Var>approval</Var><Op>.</Op><Prop>status</Prop> <Op>===</Op> <Str>&quot;approved&quot;</Str><Op>) {"{"}</Op>
              </Line>
              <Line indent={1}>
                <Kw>await</Kw> <Fn>deployToProduction</Fn><Op>()</Op>
              </Line>
              <Line>
                <Op>{"}"}</Op>
              </Line>
            </code>
          </pre>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {["Works with any framework", "No SDK required", "Approver needs no account"].map((pill) => (
            <span
              key={pill}
              className="text-xs text-[#888] bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Syntax highlighting helpers */
function Line({ children, indent = 0 }: { children: React.ReactNode; indent?: number }) {
  return (
    <div style={{ paddingLeft: indent * 24 }}>
      {children}
      {"\n"}
    </div>
  );
}
const Kw = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#c792ea]">{children} </span>
);
const Var = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#82aaff]">{children}</span>
);
const Fn = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#82aaff]">{children}</span>
);
const Op = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#89ddff]">{children}</span>
);
const Str = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#c3e88d]">{children}</span>
);
const Prop = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#f07178]">{children}</span>
);

/* ─── How It Works ────────────────────────────────────────────────────── */
const steps = [
  {
    n: "01",
    title: "Your code calls the API",
    body: "POST to /v1/approvals with the action description, approver email, and optional context. You get back an approval ID immediately.",
  },
  {
    n: "02",
    title: "Approver gets an email",
    body: "A clean, branded email arrives with Approve and Reject buttons. No login required. No account. One click.",
  },
  {
    n: "03",
    title: "Your code continues",
    body: "Poll the approval by ID or receive a webhook the instant a decision is made. Act on the result however you like.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-[#f5f4f0] py-24">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-xs font-semibold text-[#999] uppercase tracking-widest text-center mb-3">
          Simple by design
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center text-[#111] mb-16">
          How it works
        </h2>

        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.n} className="flex flex-col gap-4">
              <span className="text-4xl font-bold text-[#ddd]">{step.n}</span>
              <h3 className="text-[15px] font-semibold text-[#111]">{step.title}</h3>
              <p className="text-sm text-[#666] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0a0a0a] py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-[15px] font-semibold text-white mb-1">shonin</p>
          <p className="text-xs text-[#555] max-w-xs">
            A one-line API to pause any automation and wait for a human to approve or reject via email.
          </p>
        </div>
        <nav className="flex items-center gap-6">
          <a href="/docs" className="text-xs text-[#666] hover:text-white transition-colors">
            Docs
          </a>
          <a href="/dashboard" className="text-xs text-[#666] hover:text-white transition-colors">
            Dashboard
          </a>
          <a
            href="https://github.com/Calm-Rock/shonin"
            className="text-xs text-[#666] hover:text-white transition-colors flex items-center gap-1.5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
