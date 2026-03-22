"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type FormState = "idle" | "loading" | "success" | "error";

interface SignupResult {
  key: string;
  name: string;
  email: string;
  message?: string;
  already_exists?: boolean;
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<SignupResult | null>(null);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setState("error");
        return;
      }

      setResult(data);
      setState("success");
    } catch {
      setError("Network error — please try again");
      setState("error");
    }
  }

  function copyKey() {
    if (!result) return;
    navigator.clipboard.writeText(result.key);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/[0.06] h-14 flex items-center px-6 justify-between">
        <a href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Shonin" width={24} height={24} />
          <span className="font-semibold text-white">shonin</span>
        </a>
        <nav className="flex items-center gap-5">
          <a href="/docs" className="text-sm text-[#888] hover:text-white transition-colors">
            Docs
          </a>
          <a href="/dashboard" className="text-sm text-[#888] hover:text-white transition-colors">
            Dashboard
          </a>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {state === "success" && result ? (
            <SuccessCard result={result} copied={copied} onCopy={copyKey} />
          ) : (
            <FormCard
              name={name}
              email={email}
              loading={state === "loading"}
              error={state === "error" ? error : ""}
              onName={setName}
              onEmail={setEmail}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Form card ───────────────────────────────────────────────────────── */
function FormCard({
  name,
  email,
  loading,
  error,
  onName,
  onEmail,
  onSubmit,
}: {
  name: string;
  email: string;
  loading: boolean;
  error: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Get your API key
        </h1>
        <p className="text-sm text-[#888]">Free to start. No credit card required.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#888] mb-1.5" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => onName(e.target.value)}
            required
            disabled={loading}
            className="w-full bg-[#0a0a0a] border border-white/[0.1] text-white placeholder-[#444] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#888] mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ada@example.com"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full bg-[#0a0a0a] border border-white/[0.1] text-white placeholder-[#444] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold text-sm py-2.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Generating…
            </>
          ) : (
            "Get API Key"
          )}
        </button>
      </form>

      <p className="text-xs text-[#555] text-center mt-6">
        Already have a key?{" "}
        <a href="/dashboard" className="text-[#888] hover:text-white transition-colors underline underline-offset-2">
          View Dashboard
        </a>
      </p>
    </div>
  );
}

/* ─── Success card ────────────────────────────────────────────────────── */
function SuccessCard({
  result,
  copied,
  onCopy,
}: {
  result: SignupResult;
  copied: boolean;
  onCopy: () => void;
}) {
  const firstName = result.name.split(" ")[0];

  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-white">
            {result.already_exists ? "Welcome back" : `You're in, ${firstName}`}
          </p>
          <p className="text-xs text-[#666]">
            {result.already_exists
              ? result.message
              : "Your API key is ready. We also emailed it to you."}
          </p>
        </div>
      </div>

      {/* Key block */}
      <div className="bg-[#0a0a0a] rounded-xl border border-white/[0.06] overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-[10px] font-semibold text-[#555] uppercase tracking-widest">
            API Key
          </span>
          <button
            onClick={onCopy}
            className="text-xs text-[#555] hover:text-white transition-colors flex items-center gap-1.5"
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
        <div className="px-4 py-3.5">
          <code className="text-sm font-mono text-[#a3e635] break-all">{result.key}</code>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-3 mb-6">
        <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-xs text-yellow-200/70 leading-relaxed">
          Save this key — we won&apos;t show it again. It was also sent to{" "}
          <span className="text-yellow-200/90">{result.email}</span>.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex gap-3">
        <a
          href={`/dashboard?key=${result.key}`}
          className="flex-1 text-center text-sm font-semibold bg-white text-black py-2.5 rounded-lg hover:bg-white/90 transition-colors"
        >
          View Dashboard
        </a>
        <a
          href="/docs"
          className="flex-1 text-center text-sm font-semibold bg-white/[0.06] text-white py-2.5 rounded-lg border border-white/[0.08] hover:bg-white/10 transition-colors"
        >
          Read Docs
        </a>
      </div>
    </div>
  );
}
