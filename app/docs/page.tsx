"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ─── Types ───────────────────────────────────────────────────────────── */
interface NavItem {
  id: string;
  label: string;
}

const NAV: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quickstart" },
  { id: "authentication", label: "Authentication" },
  { id: "create-approval", label: "Create Approval" },
  { id: "get-approval", label: "Get Approval" },
  { id: "risk", label: "Risk Levels" },
  { id: "create-decision", label: "Create Decision" },
  { id: "get-decision", label: "Get Decision" },
  { id: "webhooks", label: "Webhooks" },
  { id: "how-decided", label: "How Decisions Work" },
  { id: "errors", label: "Errors" },
  { id: "self-hosting", label: "Self-Hosting" },
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
        <a href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Shonin" width={24} height={24} />
          <span className="font-semibold text-white">shonin</span>
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
          <div className="hidden sm:flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-[#888] hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="/signup" className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors">
              Try the demo
            </a>
          </div>
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
              Shonin is an open source, human-in-the-loop approval API. Send an approval request to
              any email address and wait for a human decision before your automation continues.
              Approvers need no account: they just click a link.
            </p>
            <InfoBox>
              <strong className="text-white">Base URL</strong>
              <Code inline>https://shonin.dev/api/v1</Code>
            </InfoBox>
            <p className="text-[#888] text-sm leading-relaxed">
              All requests must include an{" "}
              <Code inline>Authorization: Bearer &lt;api_key&gt;</Code> header, except the{" "}
              <Code inline>/v1/decide/:token</Code> links in approval emails, which approvers open
              and which need no key.
            </p>
            <p className="text-[#888] text-sm leading-relaxed">
              Shonin is MIT licensed. Try the hosted demo at shonin.dev, or run your own copy (see{" "}
              <button onClick={() => scrollTo("self-hosting")} className="text-white underline underline-offset-4">
                Self-Hosting
              </button>
              ).
            </p>
          </Section>

          {/* ── Quickstart ── */}
          <Section id="quickstart" title="Quickstart">
            <ol className="list-decimal pl-5 space-y-3 text-[#888] leading-relaxed">
              <li>
                Sign in with your email at{" "}
                <a href="/login" className="text-white underline underline-offset-4">/login</a>. Your API key
                is on your dashboard and is emailed to you.
              </li>
              <li>
                Send an approval request. Use your own email as the approver: the hosted demo only
                sends to your account email.
              </li>
            </ol>
            <CodeBlock lang="bash" code={`curl -X POST https://shonin.dev/api/v1/approvals \\
  -H "Authorization: Bearer sk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "Deploy to production",
    "approver_email": "you@example.com"
  }'`} />
            <ol start={3} className="list-decimal pl-5 space-y-3 text-[#888] leading-relaxed">
              <li>
                Open the email and click Approve, then read the result with the <Code inline>id</Code>{" "}
                from the response:
              </li>
            </ol>
            <CodeBlock lang="bash" code={`curl https://shonin.dev/api/v1/approvals/APPROVAL_ID \\
  -H "Authorization: Bearer sk_your_api_key"`} />
            <p className="text-[#888] text-sm leading-relaxed">
              The <Code inline>status</Code> field changes from <Code inline>pending</Code> to{" "}
              <Code inline>approved</Code> or <Code inline>rejected</Code>.
            </p>
          </Section>

          {/* ── Authentication ── */}
          <Section id="authentication" title="Authentication">
            <p className="text-[#888] leading-relaxed">
              Pass your API key as a Bearer token in the{" "}
              <Code inline>Authorization</Code> header on every request. Sign in at{" "}
              <a href="/login" className="text-white underline underline-offset-4">/login</a> to see your key.
            </p>
            <CodeBlock lang="bash" code={`curl -H "Authorization: Bearer sk_your_api_key" \\
  https://shonin.dev/api/v1/approvals/APPROVAL_ID`} />
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
              Reject buttons. Returns immediately. The approval stays{" "}
              <Code inline>pending</Code> until the approver decides.
            </p>

            <h3 className="text-sm font-semibold text-white mt-6 mb-3">Request body</h3>
            <ParamTable
              params={[
                { name: "action", type: "string", required: true, description: "A short description of what needs approval. Shown prominently in the email." },
                { name: "approver_email", type: "string", required: true, description: "The email address of the person who will approve or reject." },
                { name: "context", type: "string", required: false, description: "Optional extra context displayed in the email below the action." },
                { name: "webhook_url", type: "string", required: false, description: "Public https URL to POST the decision to when the approver clicks Approve or Reject. Private and reserved addresses are rejected with a 400." },
                { name: "expires_in_hours", type: "number", required: false, description: "How many hours before the approval link expires. Defaults to 24." },
                { name: "command_type", type: "string", required: false, description: "What kind of action this is, for example git_push_force or sql_drop. Drives the risk banner in the email. Inferred from action when omitted. See Risk Levels." },
                { name: "files", type: "array", required: false, description: "Files the action touches, for example [{ \"path\": \"app/route.ts\", \"status\": \"modified\" }]. Status is modified, added, deleted or renamed." },
                { name: "diff", type: "string", required: false, description: "A diff to show the approver. Truncated at 50KB." },
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
  "action": "git push origin main --force",
  "context": "Remote diverged after a rebase",
  "approver_email": "cto@company.com",
  "status": "approved",
  "webhook_url": null,
  "command_type": "git_push_force",
  "risk_level": "DESTRUCTIVE",
  "risk_bullets": [
    "Will overwrite upstream commits",
    "Bypasses branch protection rules"
  ],
  "files": [{ "path": "app/route.ts", "status": "modified" }],
  "expires_at": "2026-03-22T18:00:00Z",
  "decided_at": "2026-03-21T18:45:00Z",
  "created_at": "2026-03-21T18:00:00Z"
}`} />
              </div>
            </div>
          </Section>

          {/* ── Risk levels ── */}
          <Section id="risk" title="Risk Levels">
            <p className="text-[#888] leading-relaxed">
              When an approval has a <Code inline>command_type</Code>, the email opens with a risk
              banner so the approver can see how reversible the action is. If you leave{" "}
              <Code inline>command_type</Code> out, Shonin infers it from <Code inline>action</Code>{" "}
              when it recognizes commands such as <Code inline>git push --force</Code>,{" "}
              <Code inline>git reset --hard</Code>, <Code inline>rm</Code>,{" "}
              <Code inline>drop table</Code> or a migration.
            </p>
            <DataTable
              headers={["command_type", "Level", "Shown to the approver"]}
              rows={[
                ["git_push_force", "DESTRUCTIVE", "Will overwrite upstream commits. Bypasses branch protection rules."],
                ["git_reset_hard", "DESTRUCTIVE", "Local changes will be permanently lost."],
                ["rm", "DESTRUCTIVE", "Files cannot be recovered from trash."],
                ["sql_drop", "DESTRUCTIVE", "Table data is permanently deleted."],
                ["sql_migration", "HIGH", "Schema changes may be irreversible."],
                ["git_push", "LOW", "Reversible via git revert."],
                ["git_commit", "LOW", "Reversible via git reset."],
                ["anything else", "LOW", "No banner text."],
              ]}
            />
            <InfoBox>
              DESTRUCTIVE approvals add a 3 second countdown on the confirm page before the Approve
              button unlocks.
            </InfoBox>
          </Section>

          {/* ── Create Decision ── */}
          <Section
            id="create-decision"
            title="Create Decision"
            badge={{ label: "POST", color: "blue" }}
            endpoint="/v1/decisions"
          >
            <p className="text-[#888] leading-relaxed">
              Ask a multiple-choice question instead of a yes or no. The respondent gets an email
              with one button per option and picks one.
            </p>

            <h3 className="text-sm font-semibold text-white mt-6 mb-3">Request body</h3>
            <ParamTable
              params={[
                { name: "question", type: "string", required: true, description: "The question to ask." },
                { name: "options", type: "array", required: true, description: "2 to 10 options, each { \"key\": \"prod\", \"label\": \"Production\" }. A key is up to 16 characters and a label up to 200." },
                { name: "respondent_email", type: "string", required: true, description: "The email address of the person who will answer." },
                { name: "context", type: "string", required: false, description: "Optional extra context shown in the email." },
                { name: "webhook_url", type: "string", required: false, description: "Public https URL to POST the answer to." },
                { name: "expires_in_hours", type: "number", required: false, description: "How many hours before the links expire. Defaults to 24." },
              ]}
            />

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Example request</h3>
                <CodeBlock lang="bash" code={`curl -X POST https://shonin.dev/api/v1/decisions \\
  -H "Authorization: Bearer sk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "Which environment should we deploy to?",
    "options": [
      { "key": "staging", "label": "Staging" },
      { "key": "prod", "label": "Production" }
    ],
    "respondent_email": "cto@company.com"
  }'`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Example response <span className="text-[#3d9e5f] text-xs font-normal ml-1">201 Created</span></h3>
                <CodeBlock lang="json" code={`{
  "id": "e5f6a7b8-...",
  "status": "pending",
  "created_at": "2026-03-21T18:00:00Z",
  "expires_at": "2026-03-22T18:00:00Z"
}`} />
              </div>
            </div>
          </Section>

          {/* ── Get Decision ── */}
          <Section
            id="get-decision"
            title="Get Decision"
            badge={{ label: "GET", color: "green" }}
            endpoint="/v1/decisions/:id"
          >
            <p className="text-[#888] leading-relaxed">
              Returns the current state of a decision. <Code inline>status</Code> is{" "}
              <Code inline>pending</Code> or <Code inline>decided</Code>, and{" "}
              <Code inline>chosen_key</Code> holds the key of the option that was picked.
            </p>
            <CodeBlock lang="json" code={`{
  "id": "e5f6a7b8-...",
  "status": "decided",
  "chosen_key": "prod",
  "decided_at": "2026-03-21T18:45:00Z",
  "expires_at": "2026-03-22T18:00:00Z",
  "created_at": "2026-03-21T18:00:00Z"
}`} />
          </Section>

          {/* ── Webhooks ── */}
          <Section id="webhooks" title="Webhooks">
            <p className="text-[#888] leading-relaxed">
              Set <Code inline>webhook_url</Code> on an approval or a decision and Shonin sends a
              POST with a JSON body once the decision is recorded.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Approval</h3>
                <CodeBlock lang="json" code={`{
  "id": "a1b2c3d4-...",
  "status": "approved",
  "decided_at": "2026-03-21T18:45:00Z"
}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Decision</h3>
                <CodeBlock lang="json" code={`{
  "id": "e5f6a7b8-...",
  "status": "decided",
  "chosen_key": "prod",
  "decided_at": "2026-03-21T18:45:00Z"
}`} />
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[#888] leading-relaxed">
              <li>The URL must be a public https address. Private and reserved addresses are rejected with a 400 when you create the request.</li>
              <li>Shonin waits 5 seconds for a response, does not follow redirects, and sends each webhook once with no retries.</li>
            </ul>
            <InfoBox variant="warn">
              Webhook payloads are not signed. Treat one as a signal and confirm the result with a GET
              request before you act on it.
            </InfoBox>
          </Section>

          {/* ── How decisions work ── */}
          <Section id="how-decided" title="How Decisions Work">
            <p className="text-[#888] leading-relaxed">
              You never call the decide endpoint yourself. It sits behind the links in the email, and
              it is built so the code that asks for approval cannot give it.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[#888] leading-relaxed">
              <li>The approve and reject links exist only in the email to the approver. The API never returns them, so your code cannot approve its own request.</li>
              <li>Opening a link never decides. It leads to a confirm page, and the decision is recorded only when the approver confirms, which sends a POST. Mail scanners and link previews that open every link cannot decide.</li>
              <li>Links are single-use and expire after 24 hours unless you set <Code inline>expires_in_hours</Code>.</li>
            </ul>
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
                    ["400", "Validation error", "A required field is missing, a value has the wrong type, or webhook_url is not a public https address."],
                    ["401", "Invalid API key", "Missing or incorrect Authorization header."],
                    ["404", "Not found", "The ID does not exist or belongs to a different account."],
                  ].map(([code, meaning, cause]) => (
                    <tr key={code} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className={`font-mono text-xs font-semibold ${
                          code === "401" ? "text-red-400" :
                          code === "400" ? "text-yellow-400" :
                          "text-orange-400"
                        }`}>{code}</span>
                      </td>
                      <td className="px-4 py-3 text-[#ccc] text-sm">{meaning}</td>
                      <td className="px-4 py-3 text-[#666] text-sm">{cause}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-semibold text-white mt-8 mb-3">Hosted demo only</h3>
            <p className="text-[#888] text-sm leading-relaxed mb-3">
              The hosted demo is capped to protect a shared email allowance. Self-hosted instances do
              not apply these limits.
            </p>
            <DataTable
              headers={["Status", "Meaning", "Common cause"]}
              rows={[
                ["403", "Recipient not allowed", "approver_email or respondent_email is not the email on your account."],
                ["429", "Daily limit reached", "Your key has used its requests for the day."],
                ["503", "Demo budget used", "The shared email budget for today is used up. Try again tomorrow."],
              ]}
            />
          </Section>

          {/* ── Self-hosting ── */}
          <Section id="self-hosting" title="Self-Hosting">
            <p className="text-[#888] leading-relaxed">
              Shonin is MIT licensed and runs on Next.js, Supabase and Resend. A self-hosted
              instance has no request limits, and it serves this same documentation at{" "}
              <Code inline>/docs</Code>.
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-[#888] leading-relaxed">
              <li>Clone the repository and run <Code inline>npm install</Code>.</li>
              <li>Create a Supabase project and run <Code inline>supabase/schema.sql</Code> in its SQL editor.</li>
              <li>Copy <Code inline>.env.example</Code> to <Code inline>.env.local</Code> and fill in your Supabase and Resend values. Set <Code inline>EMAIL_FROM_DOMAIN</Code> to your verified Resend domain.</li>
              <li>In Supabase, set your app URL as the Site URL and as a redirect URL so login works.</li>
              <li>Insert your first API key, then run <Code inline>npm run dev</Code>.</li>
            </ol>
            <p className="text-[#888] text-sm leading-relaxed">
              The full steps, including the SQL for your first key, are in the README on{" "}
              <a
                href="https://github.com/Calm-Rock/shonin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-4"
              >
                GitHub
              </a>
              .
            </p>
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

/* ─── Data table ──────────────────────────────────────────────────────── */
function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="rounded-lg border border-white/[0.06] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-[#111]">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map((row) => (
            <tr key={row[0]} className="hover:bg-white/[0.02] transition-colors">
              {row.map((cell, i) => (
                <td key={i} className={`px-4 py-3 ${i === 0 ? "font-mono text-[13px] text-[#82aaff]" : "text-[#666] text-sm"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
