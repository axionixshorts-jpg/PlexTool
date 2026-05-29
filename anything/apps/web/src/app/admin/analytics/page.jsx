"use client";
import { useQuery } from "@tanstack/react-query";
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
  LineChart,
  Line,
} from "recharts";

function adminFetch(path) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
  return fetch(path, { headers: { Authorization: `Bearer ${token}` } }).then(
    (r) => r.json(),
  );
}

const COLORS = [
  "#39FF88",
  "#00D1FF",
  "#FFB547",
  "#FF4D67",
  "#7C3AED",
  "#EC4899",
  "#F59E0B",
  "#10B981",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E1E2A] border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <p className="text-[#A0A0A0] mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p
          key={i}
          className="flex items-center gap-2"
          style={{ color: p.color }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color }}
          />
          {p.name}: <span className="font-bold ml-1">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5">
      <h3 className="text-white text-base font-semibold">{title}</h3>
      {subtitle && (
        <p className="text-[#6B6B6B] text-xs mt-0.5 mb-4">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminFetch("/api/admin/analytics"),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminFetch("/api/admin/dashboard"),
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-white text-2xl font-bold mb-6">Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#15151C] border border-white/5 rounded-2xl h-64"
            />
          ))}
        </div>
      </div>
    );
  }

  const userGrowthData = (analyticsData?.userGrowth || []).map((d) => ({
    day: new Date(d.date).toLocaleDateString("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    "New Users": parseInt(d.count),
  }));

  const submissionData = (analyticsData?.submissionTrend || []).map((d) => ({
    day: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
    Approved: parseInt(d.approved || 0),
    Pending: parseInt(d.pending || 0),
    Rejected: parseInt(d.rejected || 0),
  }));

  const earningsData = (analyticsData?.earningsByMonth || []).map((d) => ({
    month: d.month,
    "Earnings ($)": parseFloat(d.total || 0).toFixed(2),
  }));

  const categoryData = analyticsData?.campaignsByCategory || [];
  const platformData = (analyticsData?.platformBreakdown || []).map((d) => ({
    name: d.platform,
    value: parseInt(d.count),
  }));

  const stats = dashboardData?.stats;

  const kpiCards = [
    {
      label: "Total Revenue Paid",
      value: `$${parseFloat(stats?.wallet?.total_paid_out || 0).toFixed(0)}`,
      trend: "↑ Campaign payouts",
      color: "#39FF88",
    },
    {
      label: "Pending Withdrawals",
      value: `$${parseFloat(stats?.withdrawals?.pending_amount || 0).toFixed(0)}`,
      trend: `${stats?.withdrawals?.pending_withdrawals || 0} requests`,
      color: "#FFB547",
    },
    {
      label: "Submission Rate",
      value: stats?.submissions?.total_submissions || 0,
      trend: `${stats?.submissions?.approved_submissions || 0} approved`,
      color: "#00D1FF",
    },
    {
      label: "Approval Rate",
      value:
        stats?.submissions?.total_submissions > 0
          ? `${Math.round((stats?.submissions?.approved_submissions / stats?.submissions?.total_submissions) * 100)}%`
          : "0%",
      trend: "Of all submissions",
      color: "#7C3AED",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Platform Analytics</h1>
        <p className="text-[#6B6B6B] text-sm mt-0.5">
          Real-time insights into platform performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((k, i) => (
          <div
            key={i}
            className="bg-[#15151C] border border-white/5 rounded-2xl p-4"
          >
            <div className="text-2xl font-bold text-white mb-1">{k.value}</div>
            <div className="text-[#A0A0A0] text-xs font-medium mb-1">
              {k.label}
            </div>
            <div className="text-[11px]" style={{ color: k.color }}>
              {k.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="User Growth" subtitle="Daily new registrations">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39FF88" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#39FF88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#6B6B6B", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B6B6B", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="New Users"
                stroke="#39FF88"
                strokeWidth={2}
                fill="url(#gUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Earnings" subtitle="Total paid to creators">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={earningsData}>
              <defs>
                <linearGradient id="gEarn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D1FF" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#00D1FF" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="month"
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
                dataKey="Earnings ($)"
                fill="url(#gEarn)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Submission Trends"
          subtitle="By status over last 7 days"
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={submissionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#6B6B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B6B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="Approved"
                stroke="#39FF88"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Pending"
                stroke="#FFB547"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Rejected"
                stroke="#FF4D67"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Campaigns by Category">
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.slice(0, 7).map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-[#A0A0A0] text-xs truncate">
                        {d.category}
                      </span>
                    </div>
                    <span className="text-white text-xs font-semibold">
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-[#6B6B6B] text-sm">
              No campaign data yet
            </div>
          )}
        </ChartCard>
      </div>

      {/* Platform Breakdown */}
      {platformData.length > 0 && (
        <ChartCard
          title="Submissions by Platform"
          subtitle="Distribution across social platforms"
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                type="number"
                tick={{ fill: "#6B6B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#A0A0A0", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Submissions" radius={[0, 6, 6, 0]}>
                {platformData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
