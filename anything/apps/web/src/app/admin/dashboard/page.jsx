"use client";
import { useQuery } from "@tanstack/react-query";
import { useAdmin } from "../layout";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#39FF88",
  "#00D1FF",
  "#FFB547",
  "#FF4D67",
  "#7C3AED",
  "#EC4899",
];

function adminFetch(path) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
  return fetch(path, { headers: { Authorization: `Bearer ${token}` } }).then(
    (r) => r.json(),
  );
}

function StatCard({ label, value, sub, color = "#39FF88", icon }) {
  return (
    <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div
          className="w-2 h-2 rounded-full mt-1"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value ?? "—"}</div>
      <div className="text-[#A0A0A0] text-xs font-medium">{label}</div>
      {sub && <div className="text-[#6B6B6B] text-[11px] mt-1">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-white text-lg font-bold">{title}</h2>
      {subtitle && <p className="text-[#6B6B6B] text-xs mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    active: "bg-[#39FF88]/15 text-[#39FF88]",
    pending: "bg-[#FFB547]/15 text-[#FFB547]",
    approved: "bg-[#39FF88]/15 text-[#39FF88]",
    rejected: "bg-[#FF4D67]/15 text-[#FF4D67]",
    paid: "bg-[#00D1FF]/15 text-[#00D1FF]",
    processing: "bg-[#FFB547]/15 text-[#FFB547]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${cfg[status] || "bg-white/10 text-white"}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E1E2A] border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-[#A0A0A0] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { admin } = useAdmin() || {};

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminFetch("/api/admin/dashboard"),
    refetchInterval: 60000,
  });

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminFetch("/api/admin/analytics"),
  });

  const stats = data?.stats;
  const u = stats?.users || {};
  const c = stats?.campaigns || {};
  const s = stats?.submissions || {};
  const w = stats?.wallet || {};
  const wd = stats?.withdrawals || {};

  const statCards = [
    {
      label: "Total Users",
      value: u.total_users,
      sub: `+${u.new_this_week || 0} this week`,
      icon: "👥",
      color: "#39FF88",
    },
    {
      label: "Creators",
      value: u.total_creators,
      sub: "Registered creators",
      icon: "🎬",
      color: "#00D1FF",
    },
    {
      label: "Active Campaigns",
      value: c.active_campaigns,
      sub: `${c.pending_approval || 0} pending approval`,
      icon: "📢",
      color: "#FFB547",
    },
    {
      label: "Total Submissions",
      value: s.total_submissions,
      sub: `${s.pending_submissions || 0} pending review`,
      icon: "📋",
      color: "#7C3AED",
    },
    {
      label: "Pending Withdrawals",
      value: wd.pending_withdrawals,
      sub: `$${parseFloat(wd.pending_amount || 0).toFixed(0)} total`,
      icon: "💸",
      color: "#FF4D67",
    },
    {
      label: "Total Paid Out",
      value: `$${parseFloat(w.total_paid_out || 0).toFixed(0)}`,
      sub: "Lifetime earnings",
      icon: "💰",
      color: "#32FF7E",
    },
    {
      label: "Platform Balance",
      value: `$${parseFloat(w.total_balance || 0).toFixed(0)}`,
      sub: "Active wallet balances",
      icon: "🏦",
      color: "#00D1FF",
    },
    {
      label: "Monthly Growth",
      value: `+${u.new_this_month || 0}`,
      sub: "New users this month",
      icon: "📈",
      color: "#FFB547",
    },
  ];

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-8 bg-white/5 rounded-lg w-48 mb-2" />
          <div className="h-4 bg-white/5 rounded w-64" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-[#15151C] border border-white/5 rounded-2xl h-28"
            />
          ))}
        </div>
      </div>
    );
  }

  const userGrowthData =
    analytics?.userGrowth?.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
      users: parseInt(d.count),
    })) || [];

  const submissionData =
    analytics?.submissionTrend?.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
      approved: parseInt(d.approved || 0),
      pending: parseInt(d.pending || 0),
      rejected: parseInt(d.rejected || 0),
    })) || [];

  const categoryData = analytics?.campaignsByCategory || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#6B6B6B] text-sm mt-1">
            Welcome back, {admin?.name || "Super Admin"} 👋
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#15151C] border border-[#39FF88]/20 rounded-xl px-3 py-2">
          <div
            className="w-2 h-2 rounded-full bg-[#39FF88]"
            style={{ animation: "pulse 2s infinite" }}
          />
          <span className="text-[#39FF88] text-xs font-semibold">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5">
          <SectionHeader title="User Growth" subtitle="Last 7 days signups" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39FF88" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#39FF88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6B6B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B6B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="users"
                name="New Users"
                stroke="#39FF88"
                strokeWidth={2}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Submission Trend */}
        <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5">
          <SectionHeader
            title="Submission Trends"
            subtitle="Last 7 days by status"
          />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={submissionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6B6B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B6B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="approved"
                name="Approved"
                fill="#39FF88"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                name="Pending"
                fill="#FFB547"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="rejected"
                name="Rejected"
                fill="#FF4D67"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Category Pie */}
        <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5">
          <SectionHeader title="Campaigns by Category" />
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={35}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {categoryData.slice(0, 6).map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-[#A0A0A0] text-[10px] truncate">
                      {d.category}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-[#6B6B6B] text-sm">
              No data yet
            </div>
          )}
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="Recent Withdrawals" />
            <a
              href="/admin/withdrawals"
              className="text-[#39FF88] text-xs font-semibold hover:underline"
            >
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {(data?.recentWithdrawals || []).length === 0 && (
              <div className="text-center py-8 text-[#6B6B6B] text-sm">
                No withdrawals yet
              </div>
            )}
            {(data?.recentWithdrawals || []).map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-3 p-3 bg-[#0B0B0F] rounded-xl"
              >
                <div className="w-8 h-8 rounded-full bg-[#39FF88]/10 flex items-center justify-center text-xs font-bold text-[#39FF88] flex-shrink-0">
                  {(w.user_name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {w.user_name || "Unknown"}
                  </div>
                  <div className="text-[#6B6B6B] text-xs">
                    {w.method} · {new Date(w.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white text-sm font-bold">
                    ${parseFloat(w.amount).toFixed(2)}
                  </div>
                  <StatusBadge status={w.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Submissions + Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="Recent Submissions" />
            <a
              href="/admin/submissions"
              className="text-[#39FF88] text-xs font-semibold hover:underline"
            >
              Moderate →
            </a>
          </div>
          <div className="space-y-2">
            {(data?.recentSubmissions || []).length === 0 && (
              <div className="text-center py-8 text-[#6B6B6B] text-sm">
                No submissions yet
              </div>
            )}
            {(data?.recentSubmissions || []).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 bg-[#0B0B0F] rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {s.creator_name || "Unknown"}
                  </div>
                  <div className="text-[#6B6B6B] text-xs truncate">
                    {s.campaign_title}
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="Top Campaigns" />
            <a
              href="/admin/campaigns"
              className="text-[#39FF88] text-xs font-semibold hover:underline"
            >
              Manage →
            </a>
          </div>
          <div className="space-y-2">
            {(data?.topCampaigns || []).map((c, i) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 bg-[#0B0B0F] rounded-xl"
              >
                <div className="w-6 h-6 rounded-lg bg-[#39FF88]/10 flex items-center justify-center text-[#39FF88] text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {c.title}
                  </div>
                  <div className="text-[#6B6B6B] text-xs">
                    {c.participant_count} joined · {c.platform}
                  </div>
                </div>
                <div className="text-[#39FF88] text-sm font-bold flex-shrink-0">
                  ${c.reward_amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
