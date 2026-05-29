"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

function adminFetch(path) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
  return fetch(path, { headers: { Authorization: `Bearer ${token}` } }).then(
    (r) => r.json(),
  );
}

const MODULE_COLORS = {
  auth: "#00D1FF",
  campaigns: "#39FF88",
  users: "#FFB547",
  submissions: "#7C3AED",
  wallet: "#32FF7E",
  withdrawals: "#FF4D67",
  banners: "#EC4899",
  notifications: "#F59E0B",
  settings: "#A0A0A0",
};

const ACTION_ICONS = {
  ADMIN_LOGIN: "🔐",
  CREATE_CAMPAIGN: "➕",
  UPDATE_CAMPAIGN: "✏️",
  DELETE_CAMPAIGN: "🗑",
  BAN_USER: "🚫",
  DELETE_USER: "❌",
  UPDATE_USER: "👤",
  SUBMISSION_APPROVED: "✅",
  SUBMISSION_REJECTED: "✗",
  WALLET_CREDIT: "💰",
  WALLET_DEBIT: "💸",
  WITHDRAWAL_PAID: "💳",
  WITHDRAWAL_REJECTED: "🚫",
  WITHDRAWAL_PROCESSING: "⏳",
  CREATE_BANNER: "🖼",
  UPDATE_BANNER: "✏️",
  DELETE_BANNER: "🗑",
  SEND_NOTIFICATION: "🔔",
  UPDATE_SETTINGS: "⚙️",
};

const MODULES = [
  "",
  "auth",
  "campaigns",
  "users",
  "submissions",
  "wallet",
  "withdrawals",
  "banners",
  "notifications",
  "settings",
];

export default function AuditLogsPage() {
  const [moduleFilter, setModuleFilter] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-logs", moduleFilter],
    queryFn: () =>
      adminFetch(`/api/admin/logs?module=${moduleFilter}&limit=100`),
    refetchInterval: 30000,
  });

  const logs = data?.logs || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Audit Logs</h1>
          <p className="text-[#6B6B6B] text-sm mt-0.5">
            Complete trail of all admin actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-[#15151C] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none capitalize"
          >
            {MODULES.map((m) => (
              <option key={m} value={m}>
                {m || "All Modules"}
              </option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 rounded-xl bg-[#15151C] border border-white/8 text-[#A0A0A0] hover:text-white text-sm transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="bg-[#15151C] border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[#6B6B6B] text-sm">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/3">
            {logs.map((log) => {
              const color = MODULE_COLORS[log.module] || "#A0A0A0";
              const icon = ACTION_ICONS[log.action] || "⬛";
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-white/2 transition-colors"
                >
                  <div className="text-lg flex-shrink-0 mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-sm font-medium">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {log.module}
                      </span>
                      {log.target_type && (
                        <span className="text-[#6B6B6B] text-xs">
                          · {log.target_type} #{log.target_id}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[#6B6B6B] text-xs">
                        by{" "}
                        <span className="text-[#A0A0A0]">
                          {log.admin_name || "Admin"}
                        </span>
                      </span>
                      {log.ip_address && log.ip_address !== "unknown" && (
                        <span className="text-[#6B6B6B] text-xs">
                          · {log.ip_address}
                        </span>
                      )}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-1.5 text-[#6B6B6B] text-xs truncate">
                        {Object.entries(log.details)
                          .slice(0, 3)
                          .map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`)
                          .join(" · ")}
                      </div>
                    )}
                  </div>
                  <div className="text-[#6B6B6B] text-xs flex-shrink-0 text-right">
                    <div>{new Date(log.created_at).toLocaleDateString()}</div>
                    <div>
                      {new Date(log.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
