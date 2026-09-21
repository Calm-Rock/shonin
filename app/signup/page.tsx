"use client";

import { useState } from "react";
import Image from "next/image";
import { requestLoginLink } from "@/lib/request-login-link";

type FormState = "idle" | "loading" | "success" | "error";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");

    const result = await requestLoginLink(email);
    if (result.ok) {
      setState("success");
    } else {
      setError(result.message);
      setState("error");
    }
  }

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/[0.06] h-14 flex items-center px-6 justify-between">
        <a href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Shonin" width={24} height={24} />
          <span className="font-semibold text-white">shonin</span>
        </a>
        <nav className="flex items-center gap-5">
          <a href="/docs" className="text-sm text-[#888] hover:text-white transition-colors">
            Docs
          </a>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {state === "success" ? (
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-sm text-[#888]">
                We sent a link to <span className="text-white">{email}</span>. Click it to create your account and get your API key.
              </p>
            </div>
          ) : (
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Get your API key</h1>
                <p className="text-sm text-[#888]">Free to start. No credit card required.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={state === "loading"}
                    className="w-full bg-[#0a0a0a] border border-white/[0.1] text-white placeholder-[#444] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                  />
                </div>

                {state === "error" && (
                  <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="w-full bg-white text-black font-semibold text-sm py-2.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {state === "loading" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    "Get API Key"
                  )}
                </button>
              </form>

              <p className="text-xs text-[#555] text-center mt-6">
                Already have an account?{" "}
                <a href="/login" className="text-[#888] hover:text-white transition-colors underline underline-offset-2">
                  Log in
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
