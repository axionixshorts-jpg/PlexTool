"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function adminFetch(path, opts = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
  return fetch(path, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  }).then((r) => r.json());
}

function StatusBadge({ status }) {
  const cfg = {
    pending: "bg-[#FFB547]/15 text-[#FFB547]",
    approved: "bg-[#39FF88]/15 text-[#39FF88]",
    processing: "bg-[#00D1FF]/15 text-[#00D1FF]",
    paid: "bg-[#32FF7E]/15 text-[#32FF7E]",
    rejected: "bg-[#FF4D67]/15 text-[#FF4D67]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${cfg[status] || "bg-white/10 text-white"}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const METHOD_INFO = {
  upi: { label: "UPI", icon: "📱" },
  bank: { label: "Bank Transfer", icon: "🏦" },
  paypal: { label: "PayPal", icon: "💳" },
};

export default function WithdrawalsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals", statusFilter],
    queryFn: () =>
      adminFetch(`/api/admin/withdrawals?status=${statusFilter}&limit=50`),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) =>
      adminFetch(`/api/admin/withdrawals/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      setSelected(null);
    },
  });

  const tabs = [
    { label: "Pending", value: "pending", color: "#FFB547" },
    { label: "Processing", value: "processing", color: "#00D1FF" },
    { label: "Paid", value: "paid", color: "#39FF88" },
    { label: "Rejected", value: "rejected", color: "#FF4D67" },
    { label: "All", value: "", color: "#A0A0A0" },
  ];

  const withdrawals = data?.withdrawals || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">
            Withdrawal Management
          </h1>
          <p className="text-[#6B6B6B] text-sm mt-0.5">
            Pending amount:{" "}
            <span className="text-[#FFB547] font-semibold">
              ${parseFloat(data?.pendingAmount || 0).toFixed(2)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#15151C] border border-white/5 rounded-xl px-4 py-2.5">
          <span className="text-[#6B6B6B] text-sm">Total pending:</span>
          <span className="text-white font-bold">
            ${parseFloat(data?.pendingAmount || 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === tab.value ? "text-black font-semibold" : "bg-[#15151C] border border-white/5 text-[#A0A0A0] hover:text-white"}`}
            style={
              statusFilter === tab.value
                ? {
                    background: `linear-gradient(135deg, ${tab.color}CC, ${tab.color}88)`,
                  }
                : {}
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#15151C] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  "User",
                  "Amount",
                  "Method",
                  "Wallet Balance",
                  "Status",
                  "Requested",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[#6B6B6B] text-xs font-semibold uppercase tracking-wider py-3.5 px-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/3">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 bg-white/5 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-[#6B6B6B] text-sm"
                  >
                    No withdrawals found
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const methodInfo = METHOD_INFO[w.method] || {
                    label: w.method,
                    icon: "💰",
                  };
                  return (
                    <tr
                      key={w.id}
                      className="border-b border-white/3 hover:bg-white/2 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="text-white text-sm font-medium">
                          {w.user_name}
                        </div>
                        <div className="text-[#6B6B6B] text-xs">
                          {w.user_email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-white text-base font-bold">
                          ${parseFloat(w.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[#A0A0A0] text-sm">
                          <span>{methodInfo.icon}</span>
                          <span>{methodInfo.label}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#39FF88] text-sm font-semibold">
                        ${parseFloat(w.current_balance || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={w.status} />
                      </td>
                      <td className="py-3.5 px-4 text-[#6B6B6B] text-xs">
                        {new Date(w.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {w.status === "pending" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                updateMutation.mutate({
                                  id: w.id,
                                  status: "processing",
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] text-xs font-semibold"
                            >
                              Process
                            </button>
                            <button
                              onClick={() =>
                                updateMutation.mutate({
                                  id: w.id,
                                  status: "rejected",
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#FF4D67]/10 text-[#FF4D67] text-xs font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {w.status === "processing" && (
                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                id: w.id,
                                status: "paid",
                              })
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-black"
                            style={{
                              background:
                                "linear-gradient(135deg, #39FF88, #00D1FF)",
                            }}
                          >
                            Mark Paid
                          </button>
                        )}
                        {(w.status === "paid" || w.status === "rejected") && (
                          <span className="text-[#6B6B6B] text-xs">
                            {w.processed_at
                              ? new Date(w.processed_at).toLocaleDateString()
                              : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
