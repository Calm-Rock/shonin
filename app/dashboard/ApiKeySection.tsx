"use client";

import { useState } from "react";

interface Props {
  initialKey: string;
  onRotate: () => Promise<{ key: string }>;
}

export default function ApiKeySection({ initialKey, onRotate }: Props) {
  const [currentKey, setCurrentKey] = useState(initialKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rotating, setRotating] = useState(false);

  const maskedKey = `sk_live_${"•".repeat(16)}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(currentKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRotate() {
    setRotating(true);
    setShowConfirm(false);
    try {
      const { key } = await onRotate();
      setCurrentKey(key);
      setRevealed(true);
    } finally {
      setRotating(false);
    }
  }

  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5">
      <p className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-4">
        API Key
      </p>

      <div className="bg-[#0a0a0a] rounded-lg border border-white/[0.06] px-4 py-3 mb-4 font-mono text-sm text-[#a3e635] break-all">
        {revealed ? currentKey : maskedKey}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setRevealed((r) => !r)}
          className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-1.5 rounded-lg"
        >
          {revealed ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              Hide
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Reveal
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-1.5 rounded-lg"
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

        <button
          onClick={() => setShowConfirm(true)}
          disabled={rotating}
          className="flex items-center gap-1.5 text-xs text-[#888] hover:text-red-400 transition-colors bg-white/[0.04] hover:bg-red-400/[0.06] border border-white/[0.06] hover:border-red-400/20 px-3 py-1.5 rounded-lg disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {rotating ? "Rotating…" : "Rotate key"}
        </button>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="mt-4 bg-red-500/5 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-300 mb-3">
            This will invalidate your current key immediately. Any integrations using it will stop working.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRotate}
              className="text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Yes, rotate it
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs text-[#888] hover:text-white transition-colors px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
