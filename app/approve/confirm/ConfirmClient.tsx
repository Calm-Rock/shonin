'use client';

import { useState, useEffect } from 'react';
import type { RiskLevel } from '@/lib/risk';

const RISK_COLORS: Record<RiskLevel, { bg: string; border: string; text: string; label: string }> = {
  DESTRUCTIVE: {
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#b91c1c',
    label: 'DESTRUCTIVE · This action cannot be undone',
  },
  HIGH: {
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#b45309',
    label: 'HIGH RISK · Review carefully before approving',
  },
  LOW: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    text: '#15803d',
    label: 'LOW RISK · Reversible action',
  },
};

interface Props {
  action: string;
  riskLevel: RiskLevel;
  riskBullets: string[];
  approveToken: string;
  rejectToken: string;
}

const COUNTDOWN_SECONDS = 3;

export default function ConfirmClient({
  action,
  riskLevel,
  riskBullets,
  approveToken,
  rejectToken,
}: Props) {
  const isDestructive = riskLevel === 'DESTRUCTIVE';
  const [countdown, setCountdown] = useState(isDestructive ? COUNTDOWN_SECONDS : 0);
  const risk = RISK_COLORS[riskLevel] ?? RISK_COLORS.LOW;

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const approveDisabled = countdown > 0;
  const approveLabel = countdown > 0 ? `Confirm in ${countdown}…` : 'Confirm Approve';

  function handleApprove() {
    window.location.href = `/api/v1/decide/${approveToken}`;
  }

  function handleReject() {
    window.location.href = `/api/v1/decide/${rejectToken}`;
  }

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#f6f9fc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e6ebf1',
          borderRadius: '12px',
          maxWidth: '480px',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Risk banner */}
        <div
          style={{
            backgroundColor: risk.bg,
            borderBottom: `1px solid ${risk.border}`,
            padding: '14px 24px',
          }}
        >
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: risk.text }}>
            {risk.label}
          </p>
          {riskBullets.length > 0 && (
            <ul style={{ margin: '6px 0 0', paddingLeft: '16px' }}>
              {riskBullets.map((b) => (
                <li key={b} style={{ fontSize: '12px', color: risk.text, marginBottom: '2px' }}>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ padding: '28px 24px 24px' }}>
          {/* Action */}
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Command
          </p>
          <p style={{ margin: '0 0 28px', fontSize: '17px', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            {action}
          </p>

          {/* Approve button */}
          <button
            onClick={handleApprove}
            disabled={approveDisabled}
            aria-live="polite"
            style={{
              display: 'block',
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: approveDisabled ? '#d1fae5' : '#16a34a',
              color: approveDisabled ? '#6b7280' : '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: approveDisabled ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
              transition: 'background-color 0.2s',
              minHeight: '44px',
            }}
          >
            {approveLabel}
          </button>

          {/* Reject link */}
          <button
            onClick={handleReject}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              minHeight: '44px',
            }}
          >
            Reject
          </button>

          <p style={{ margin: '16px 0 0', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
            Powered by Shonin
          </p>
        </div>
      </div>
    </div>
  );
}
