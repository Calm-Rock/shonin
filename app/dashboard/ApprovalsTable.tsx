"use client";

import { useState, useMemo } from "react";
import { StatusBadge } from "@/components/StatusBadge";

interface Approval {
  id: string;
  action: string;
  approver_email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  decided_at: string | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

const PAGE_SIZE = 20;

export default function ApprovalsTable({ approvals }: { approvals: Approval[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return approvals.filter((a) => {
      const matchesSearch = search === "" || a.action.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || a.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [approvals, search, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const page_ = Math.min(page, Math.max(1, totalPages));
  const rows = filtered.slice((page_ - 1) * PAGE_SIZE, page_ * PAGE_SIZE);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleFilter(v: typeof filter) {
    setFilter(v);
    setPage(1);
  }

  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search actions…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/[0.08] text-white placeholder-[#444] text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-white/20 transition-colors"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => handleFilter(e.target.value as typeof filter)}
          className="bg-[#0a0a0a] border border-white/[0.08] text-[#888] text-sm rounded-lg px-3 py-2 outline-none focus:border-white/20 transition-colors"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#555] text-sm">
            {approvals.length === 0 ? "No approvals yet." : "No approvals match your filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0d0d0d]">
                {["Action", "Approver", "Status", "Created", "Decided"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium max-w-xs truncate">{row.action}</td>
                  <td className="px-4 py-3 text-[#888]">{row.approver_email}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 text-[#555] whitespace-nowrap">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3 text-[#555] whitespace-nowrap">
                    {row.decided_at ? formatDate(row.decided_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <p className="text-xs text-[#555]">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page_ === 1}
              className="text-xs text-[#666] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-[#555] px-2">
              {page_} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page_ === totalPages}
              className="text-xs text-[#666] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
