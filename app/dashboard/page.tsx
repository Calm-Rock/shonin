import Image from "next/image";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import SignOutButton from "./SignOutButton";
import ApiKeySection from "./ApiKeySection";
import ApprovalsTable from "./ApprovalsTable";

interface Approval {
  id: string;
  action: string;
  approver_email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  decided_at: string | null;
}

interface DayData {
  label: string;
  count: number;
  approved: number;
  rejected: number;
  pending: number;
}

function buildChartData(approvals: Approval[]): DayData[] {
  const days: DayData[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayRows = approvals.filter((a) => a.created_at.slice(0, 10) === dateStr);
    days.push({
      label,
      count: dayRows.length,
      approved: dayRows.filter((a) => a.status === "approved").length,
      rejected: dayRows.filter((a) => a.status === "rejected").length,
      pending: dayRows.filter((a) => a.status === "pending").length,
    });
  }
  return days;
}

function BarChart({ data }: { data: DayData[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartH = 72;
  const barW = 28;
  const gap = 12;
  const totalW = data.length * barW + (data.length - 1) * gap;

  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + 24}`} className="w-full" aria-hidden>
      {data.map((d, i) => {
        const x = i * (barW + gap);
        const barH = d.count === 0 ? 4 : Math.max(4, Math.round((d.count / maxCount) * chartH));
        const y = chartH - barH;

        let fill = "#2a2a2a";
        if (d.count > 0) {
          if (d.approved >= d.rejected && d.approved >= d.pending) fill = "#4ade80";
          else if (d.rejected >= d.approved && d.rejected >= d.pending) fill = "#f87171";
          else fill = "#facc15";
        }

        return (
          <g key={d.label}>
            {d.count > 0 && (
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#666"
              >
                {d.count}
              </text>
            )}
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill={fill} fillOpacity={0.8} />
            <text
              x={x + barW / 2}
              y={chartH + 16}
              textAnchor="middle"
              fontSize="9"
              fill="#555"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-xl px-4 py-4">
      <p className="text-xs text-[#555] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color ?? "text-white"}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: keyRow } = await supabaseAdmin
    .from("api_keys")
    .select("key")
    .eq("user_id", user.id)
    .maybeSingle();

  const apiKey = keyRow?.key ?? "";

  const { data: approvalsData } = await supabaseAdmin
    .from("approvals")
    .select("id, action, approver_email, status, created_at, decided_at")
    .eq("account_id", apiKey)
    .order("created_at", { ascending: false });

  const approvals = (approvalsData ?? []) as Approval[];

  const total = approvals.length;
  const approved = approvals.filter((a) => a.status === "approved").length;
  const rejected = approvals.filter((a) => a.status === "rejected").length;
  const pending = approvals.filter((a) => a.status === "pending").length;

  const chartData = buildChartData(approvals);

  async function rotateKey(): Promise<{ key: string }> {
    "use server";
    const srv = await createSupabaseServerClient();
    const {
      data: { user: u },
    } = await srv.auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const newKey = `sk_live_${nanoid(24)}`;
    await supabaseAdmin.from("api_keys").update({ key: newKey }).eq("user_id", u.id);
    return { key: newKey };
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
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
          <SignOutButton />
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#555] mt-0.5">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={total} />
          <StatCard label="Approved" value={approved} color="text-green-400" />
          <StatCard label="Rejected" value={rejected} color="text-red-400" />
          <StatCard label="Pending" value={pending} color="text-yellow-400" />
        </div>

        {/* Two-column section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5">
            <p className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-4">
              Last 7 Days
            </p>
            <BarChart data={chartData} />
          </div>

          {/* API key */}
          <ApiKeySection initialKey={apiKey} onRotate={rotateKey} />
        </div>

        {/* Approvals table */}
        <div>
          <p className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-4">
            Approvals
          </p>
          <ApprovalsTable approvals={approvals} />
        </div>
      </main>
    </div>
  );
}
