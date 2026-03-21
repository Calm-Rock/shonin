"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Types ───────────────────────────────────────────────────────────── */
interface NavItem {
  id: string;
  label: string;
}

const NAV: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "create-approval", label: "Create Approval" },
  { id: "get-approval", label: "Get Approval" },
  { id: "decide", label: "Decide" },
  { id: "errors", label: "Errors" },
];

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function DocsPage() {
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Highlight sidebar item based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen" style={{ scrollBehavior: "smooth" }}>
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/[0.06] h-14 flex items-center px-6 justify-between">
        <a href="/" className="text-[15px] font-semibold tracking-tight text-white">
          shonin
        </a>
        <div className="flex items-center gap-5">
          {/* Mobile sidebar toggle */}
          <button
            className="sm:hidden text-[#888] hover:text-white"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
          <a href="/dashboard" className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors hidden sm:inline-flex">
            Get Started
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex relative">
        {/* ─── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          className={`
            fixed sm:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-56 shrink-0
            border-r border-white/[0.06] bg-[#0a0a0a] overflow-y-auto
            transition-transform duration-200
            ${mobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
          `}
        >
          <nav className="px-4 py-8 flex flex-col gap-0.5">
            <p className="text-[10px] font-semibold text-[#444] uppercase tracking-widest mb-3 px-2">
              API Reference
            </p>
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-left w-full text-sm px-2 py-1.5 rounded-md transition-colors ${
                  active === item.id
                    ? "text-white bg-white/[0.07]"
                    : "text-[#666] hover:text-[#bbb] hover:bg-white/[0.03]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 sm:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ─── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 sm:px-12 py-12 space-y-20">
          {/* ── Overview ── */}
          <Section id="overview" title="Overview">
            <p className="text-[#888] leading-relaxed">
              Shonin is a human-in-the-loop approval API. Send an approval request to any email
              address and wait for a human decision before your automation continues. No account
              required for approvers — they just click a link.
            </p>
            <InfoBox>
              <strong className="text-white">Base URL</strong>
              <Code inline>https://shonin.dev/api/v1</Code>
            </InfoBox>
            <p className="text-[#888] text-sm leading-relaxed">
              All requests must include an{" "}
              <Code inline>Authorization: Bearer &lt;api_key&gt;</Code> header, except the{" "}
              <Code inline>GET /v1/decide/:token</Code> endpoint which is public and used directly
              by approvers clicking email links.
            </p>
          </Section>

          {/* ── Authentication ── */}
          <Section id="authentication" title="Authentication">
            <p className="text-[#888] leading-relaxed">
              Pass your API key as a Bearer token in the{" "}
              <Code inline>Authorization</Code> header on every request.
            </p>
            <CodeBlock lang="bash" code={`curl -H "Authorization: Bearer sk_your_api_key" \\
  https://shonin.dev/api/v1/approvals`} />
            <InfoBox variant="warn">
              Keep your API key secret. Do not expose it in client-side code or public repositories.
            </InfoBox>
          </Section>

          {/* ── Create Approval ── */}
          <Section
            id="create-approval"
            title="Create Approval"
            badge={{ label: "POST", color: "blue" }}
            endpoint="/v1/approvals"
          >
            <p className="text-[#888] leading-relaxed">
              Creates a new approval request and sends an email to the approver with Approve and
              Reject buttons. Returns immediately — the approval will be in{" "}
              <Code inline>pending</Code> status until the approver decides.
            </p>

            <h3 className="text-sm font-semibold text-white mt-6 mb-3">Request body</h3>
            <ParamTable
              params={[
                { name: "action", type: "string", required: true, description: "A short description of what needs approval. Shown prominently in the email." },
                { name: "approver_email", type: "string", required: true, description: "The email address of the person who will approve or reject." },
                { name: "context", type: "string", required: false, description: "Optional extra context displayed in the email below the action." },
                { name: "webhook_url", type: "string", required: false, description: "URL to POST the decision to when the approver clicks Approve or Reject." },
                { name: "expires_in_hours", type: "number", required: false, description: "How many hours before the approval link expires. Defaults to 24." },
              ]}
            />

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Example request</h3>
                <CodeBlock lang="bash" code={`curl -X POST https://shonin.dev/api/v1/approvals \\
  -H "Authorization: Bearer sk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "Deploy to production",
    "approver_email": "cto@company.com",
    "context": "PR #247 merged, 3 files changed",
    "webhook_url": "https://yourapp.com/webhooks/shonin"
  }'`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Example response <span className="text-[#3d9e5f] text-xs font-normal ml-1">201 Created</span></h3>
                <CodeBlock lang="json" code={`{
  "id": "a1b2c3d4-...",
  "status": "pending",
  "approve_token": "Abc123...",
  "reject_token": "Xyz789...",
  "created_at": "2026-03-21T18:00:00Z",
  "expires_at": "2026-03-22T18:00:00Z"
}`} />
              </div>
            </div>
          </Section>

          {/* ── Get Approval ── */}
          <Section
            id="get-approval"
            title="Get Approval"
            badge={{ label: "GET", color: "green" }}
            endpoint="/v1/approvals/:id"
          >
            <p className="text-[#888] leading-relaxed">
              Returns the current state of an approval. Use this to poll for a decision if you are
              not using webhooks. Only approvals belonging to the authenticated account are returned.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Example request</h3>
                <CodeBlock lang="bash" code={`curl https://shonin.dev/api/v1/approvals/a1b2c3d4 \\
  -H "Authorization: Bearer sk_your_api_key"`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Example response <span className="text-[#3d9e5f] text-xs font-normal ml-1">200 OK</span></h3>
                <CodeBlock lang="json" code={`{
  "id": "a1b2c3d4-...",
  "account_id": "sk_your_api_key",
  "action": "Deploy to production",
  "approver_email": "cto@company.com",
  "context": "PR #247 merged, 3 files changed",
  "status": "approved",
  "webhook_url": "https://yourapp.com/webhooks/shonin",
  "expires_at": "2026-03-22T18:00:00Z",
  "decided_at": "2026-03-21T18:45:00Z",
  "created_at": "2026-03-21T18:00:00Z"
}`} />
              </div>
            </div>
          </Section>

          {/* ── Decide ── */}
          <Section
            id="decide"
            title="Decide"
            badge={{ label: "GET", color: "green" }}
            endpoint="/v1/decide/:token"
          >
            <p className="text-[#888] leading-relaxed">
              Records the approver&apos;s decision and returns an HTML confirmation page. This endpoint
              requires no authentication — it is the URL embedded in the approval email that the
              approver clicks directly.
            </p>
            <InfoBox>
              Each approval has two tokens: an <Code inline>approve_token</Code> and a{" "}
              <Code inline>reject_token</Code>. The appropriate button in the email links to the
              matching token URL. Tokens are single-use.
            </InfoBox>

            <h3 className="text-sm font-semibold text-white mt-6 mb-3">Path parameter</h3>
            <ParamTable
              params={[
                { name: "token", type: "string", required: true, description: "The approve_token or reject_token from the approval object. Determines the decision recorded." },
              ]}
            />

            <h3 className="text-sm font-semibold text-white mt-6 mb-3">Behavior</h3>
            <div className="space-y-2">
              {[
                ["Token matches approve_token", "Records status = approved, fires webhook if set, returns HTML success page."],
                ["Token matches reject_token", "Records status = rejected, fires webhook if set, returns HTML rejection page."],
                ["Approval already decided", "Returns an HTML page indicating it was already acted on. No change to state."],
                ["Approval expired", "Returns an HTML expired page. No change to state."],
                ["Token not found", "Returns an HTML invalid link page."],
              ].map(([condition, result]) => (
                <div key={condition} className="flex gap-3 text-sm bg-[#111] rounded-lg px-4 py-3 border border-white/[0.06]">
                  <span className="text-[#aaa] shrink-0 w-48">{condition}</span>
                  <span className="text-[#666]">{result}</span>
                </div>
              ))}
            </div>

            {/* Webhook */}
            <h3 className="text-sm font-semibold text-white mt-8 mb-3">Webhook payload</h3>
            <p className="text-[#888] text-sm mb-3">
              If <Code inline>webhook_url</Code> was set on the approval, Shonin will POST the
              following JSON immediately after the decision is recorded.
            </p>
            <CodeBlock lang="json" code={`{
  "id": "a1b2c3d4-...",
  "status": "approved",
  "decided_at": "2026-03-21T18:45:00Z"
}`} />
          </Section>

          {/* ── Errors ── */}
          <Section id="errors" title="Errors">
            <p className="text-[#888] leading-relaxed mb-6">
              All errors return a JSON object with an <Code inline>error</Code> field containing a
              human-readable message.
            </p>
            <CodeBlock lang="json" code={`{ "error": "Invalid API key" }`} />

            <h3 className="text-sm font-semibold text-white mt-8 mb-3">Error codes</h3>
            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#111]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">Meaning</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">Common cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ["401", "Invalid API key", "Missing or incorrect Authorization header."],
                    ["400", "Validation error", "Required field missing or value is the wrong type."],
                    ["404", "Not found", "Approval ID does not exist or belongs to a different account."],
                    ["410", "Expired", "The approval link has passed its expiry time."],
                    ["409", "Already decided", "An approve or reject action has already been recorded."],
                  ].map(([code, meaning, cause]) => (
                    <tr key={code} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className={`font-mono text-xs font-semibold ${
                          code === "401" || code === "409" ? "text-red-400" :
                          code === "400" ? "text-yellow-400" :
                          code === "404" ? "text-orange-400" :
                          "text-[#888]"
                        }`}>{code}</span>
                      </td>
                      <td className="px-4 py-3 text-[#ccc] text-sm">{meaning}</td>
                      <td className="px-4 py-3 text-[#666] text-sm">{cause}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}

/* ─── Section wrapper ─────────────────────────────────────────────────── */
function Section({
  id,
  title,
  badge,
  endpoint,
  children,
}: {
  id: string;
  title: string;
  badge?: { label: string; color: "green" | "blue" };
  endpoint?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
        {badge && (
          <MethodBadge label={badge.label} color={badge.color} />
        )}
        {endpoint && (
          <code className="text-sm text-[#888] font-mono bg-white/[0.04] px-2.5 py-0.5 rounded-md border border-white/[0.06]">
            {endpoint}
          </code>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function MethodBadge({ label, color }: { label: string; color: "green" | "blue" }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-md font-mono ${
      color === "green"
        ? "bg-green-500/10 text-green-400 border border-green-500/20"
        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    }`}>
      {label}
    </span>
  );
}

/* ─── InfoBox ─────────────────────────────────────────────────────────── */
function InfoBox({ children, variant = "info" }: { children: React.ReactNode; variant?: "info" | "warn" }) {
  return (
    <div className={`rounded-lg px-4 py-3.5 text-sm leading-relaxed border ${
      variant === "warn"
        ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-200/70"
        : "bg-white/[0.03] border-white/[0.08] text-[#888]"
    }`}>
      {children}
    </div>
  );
}

/* ─── Inline code ─────────────────────────────────────────────────────── */
function Code({ children, inline }: { children: React.ReactNode; inline?: boolean }) {
  if (inline) {
    return (
      <code className="text-[13px] font-mono bg-white/[0.06] text-[#ccc] px-1.5 py-0.5 rounded">
        {children}
      </code>
    );
  }
  return <code>{children}</code>;
}

/* ─── Code block ──────────────────────────────────────────────────────── */
function CodeBlock({ code, lang }: { code: string; lang: string }) {
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
          className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
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

/* ─── Syntax highlighting ─────────────────────────────────────────────── */
function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  if (lang === "json") return <span dangerouslySetInnerHTML={{ __html: highlightJson(code) }} />;
  if (lang === "bash") return <span dangerouslySetInnerHTML={{ __html: highlightBash(code) }} />;
  return <span>{code}</span>;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

/* ─── Param table ─────────────────────────────────────────────────────── */
interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

function ParamTable({ params }: { params: Param[] }) {
  return (
    <div className="rounded-lg border border-white/[0.06] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-[#111]">
            {["Name", "Type", "Required", "Description"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {params.map((p) => (
            <tr key={p.name} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 font-mono text-[13px] text-[#82aaff]">{p.name}</td>
              <td className="px-4 py-3 font-mono text-[13px] text-[#c792ea]">{p.type}</td>
              <td className="px-4 py-3">
                {p.required ? (
                  <span className="text-[10px] font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                    required
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-[#555] bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                    optional
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-[#666] leading-relaxed">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
