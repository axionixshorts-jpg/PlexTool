import { useState, useEffect, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

const tabs = ["Dashboard", "Campaigns", "Submissions", "Users", "Payouts"];

function StatusBadge({ status }) {
  const config = {
    active: "bg-[#32FF7E]/15 text-[#32FF7E]",
    pending: "bg-[#FFB547]/15 text-[#FFB547]",
    approved: "bg-[#32FF7E]/15 text-[#32FF7E]",
    rejected: "bg-[#FF4D67]/15 text-[#FF4D67]",
    completed: "bg-[#39FF88]/15 text-[#39FF88]",
    processing: "bg-[#FFB547]/15 text-[#FFB547]",
    paid: "bg-[#32FF7E]/15 text-[#32FF7E]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${config[status] || config.pending}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "active" || status === "approved" || status === "paid" ? "bg-[#32FF7E]" : status === "rejected" ? "bg-[#FF4D67]" : "bg-[#FFB547]"}`}
      />
      {status}
    </span>
  );
}

function DashboardTab() {
  const { data: campaignData } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns?limit=50");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const campaigns = campaignData?.campaigns || [];

  const stats = [
    {
      label: "Total Campaigns",
      value: campaigns.length,
      change: "+3 this week",
      color: "#39FF88",
    },
    {
      label: "Active Campaigns",
      value: campaigns.filter((c) => c.status === "active").length,
      change: "Currently running",
      color: "#00D1FF",
    },
    {
      label: "Total Participants",
      value: campaigns.reduce(
        (sum, c) => sum + (c.current_participants || 0),
        0,
      ),
      change: "Across all campaigns",
      color: "#FFB547",
    },
    {
      label: "Total Rewards",
      value: `$${campaigns.reduce((sum, c) => sum + parseFloat(c.reward_amount || 0), 0).toLocaleString()}`,
      change: "Budget allocated",
      color: "#7C3AED",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[#15151C] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
              <span className="text-[#A0A0A0] text-xs font-medium">
                {stat.label}
              </span>
            </div>
            <div className="text-white text-2xl font-bold font-inter mb-1">
              {stat.value}
            </div>
            <span className="text-[#6B6B6B] text-xs">{stat.change}</span>
          </div>
        ))}
      </div>

      <div className="bg-[#15151C] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5">
        <h3 className="text-white text-lg font-semibold font-inter mb-4">
          Recent Campaigns
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left text-[#6B6B6B] text-xs font-medium py-3 px-4">
                  Campaign
                </th>
                <th className="text-left text-[#6B6B6B] text-xs font-medium py-3 px-4">
                  Brand
                </th>
                <th className="text-left text-[#6B6B6B] text-xs font-medium py-3 px-4">
                  Reward
                </th>
                <th className="text-left text-[#6B6B6B] text-xs font-medium py-3 px-4">
                  Platform
                </th>
                <th className="text-left text-[#6B6B6B] text-xs font-medium py-3 px-4">
                  Status
                </th>
                <th className="text-left text-[#6B6B6B] text-xs font-medium py-3 px-4">
                  Participants
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 10).map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-3 px-4 text-white text-sm font-medium">
                    {c.title}
                  </td>
                  <td className="py-3 px-4 text-[#A0A0A0] text-sm">
                    {c.brand_name}
                  </td>
                  <td className="py-3 px-4 text-[#39FF88] text-sm font-semibold">
                    ${c.reward_amount}
                  </td>
                  <td className="py-3 px-4 text-[#A0A0A0] text-sm">
                    {c.platform}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 px-4 text-[#A0A0A0] text-sm">
                    {c.current_participants}/{c.max_participants || "∞"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CampaignsTab() {
  const { data } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns?limit=50");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const campaigns = data?.campaigns || [];

  return (
    <div className="bg-[#15151C] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white text-lg font-semibold font-inter">
          Campaign Management
        </h3>
        <span className="text-[#A0A0A0] text-sm">
          {campaigns.length} campaigns
        </span>
      </div>
      <div className="space-y-3">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-4 p-4 bg-[#0B0B0F] rounded-xl border border-[rgba(255,255,255,0.03)]"
          >
            <img
              src={c.brand_logo}
              alt=""
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">
                {c.title}
              </div>
              <div className="text-[#6B6B6B] text-xs">
                {c.brand_name} · {c.category}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#39FF88] text-sm font-bold">
                ${c.reward_amount}
              </div>
              <div className="text-[#6B6B6B] text-xs">{c.platform}</div>
            </div>
            <StatusBadge status={c.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmissionsTab() {
  return (
    <div className="bg-[#15151C] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5">
      <h3 className="text-white text-lg font-semibold font-inter mb-4">
        Submission Review
      </h3>
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-[#6B6B6B] text-4xl mb-3">📋</div>
          <p className="text-[#A0A0A0] text-sm">
            Submissions will appear here once creators submit content
          </p>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="bg-[#15151C] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5">
      <h3 className="text-white text-lg font-semibold font-inter mb-4">
        User Management
      </h3>
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-[#6B6B6B] text-4xl mb-3">👥</div>
          <p className="text-[#A0A0A0] text-sm">
            Registered users will appear here
          </p>
        </div>
      </div>
    </div>
  );
}

function PayoutsTab() {
  return (
    <div className="bg-[#15151C] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5">
      <h3 className="text-white text-lg font-semibold font-inter mb-4">
        Payout Controls
      </h3>
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-[#6B6B6B] text-4xl mb-3">💰</div>
          <p className="text-[#A0A0A0] text-sm">
            Withdrawal requests will appear here for processing
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const tabContent = {
    Dashboard: <DashboardTab />,
    Campaigns: <CampaignsTab />,
    Submissions: <SubmissionsTab />,
    Users: <UsersTab />,
    Payouts: <PayoutsTab />,
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] font-inter">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-60 bg-[#15151C] border-r border-[rgba(255,255,255,0.05)] flex flex-col z-10 hidden md:flex">
        <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#39FF88]/20 flex items-center justify-center">
              <span className="text-[#39FF88] text-sm font-bold">C</span>
            </div>
            <span className="text-white text-base font-bold">CreatorHub</span>
          </div>
          <span className="text-[#6B6B6B] text-xs mt-1 block">Admin Panel</span>
        </div>

        <nav className="flex-1 p-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium mb-1 transition-colors ${
                activeTab === tab
                  ? "bg-[rgba(57,255,136,0.1)] text-[#39FF88]"
                  : "text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:ml-60 p-6 md:p-8">
        {/* Mobile Nav */}
        <div className="md:hidden flex gap-2 overflow-x-auto mb-6 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[rgba(57,255,136,0.15)] text-[#39FF88]"
                  : "bg-[#15151C] text-[#A0A0A0]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold font-inter tracking-tight">
            {activeTab}
          </h1>
          <p className="text-[#6B6B6B] text-sm mt-1">
            Manage your creator platform
          </p>
        </div>

        {tabContent[activeTab]}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );
}
