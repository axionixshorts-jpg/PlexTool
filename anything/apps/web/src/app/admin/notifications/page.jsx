"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

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

const NOTIF_TYPES = [
  "system",
  "new_campaign",
  "reward",
  "announcement",
  "maintenance",
  "bonus",
];
const TARGETS = [
  {
    value: "all",
    label: "All Users",
    icon: "👥",
    desc: "Send to every registered user",
  },
  {
    value: "creators",
    label: "Creators Only",
    icon: "🎬",
    desc: "Send to creator accounts only",
  },
  {
    value: "brands",
    label: "Brands Only",
    icon: "🏢",
    desc: "Send to brand accounts only",
  },
];

export default function NotificationsPage() {
  const [target, setTarget] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("system");
  const [sent, setSent] = useState(null);

  const sendMutation = useMutation({
    mutationFn: () =>
      adminFetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({
          target,
          title,
          message,
          notification_type: type,
        }),
      }),
    onSuccess: (data) => {
      setSent(data);
      setTitle("");
      setMessage("");
    },
  });

  const { data: logsData } = useQuery({
    queryKey: ["admin-notif-logs"],
    queryFn: () => adminFetch("/api/admin/notifications"),
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Push Notifications</h1>
        <p className="text-[#6B6B6B] text-sm mt-0.5">
          Send system-wide notifications to users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="bg-[#15151C] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white text-lg font-semibold mb-5">
            Compose Notification
          </h2>

          {/* Target Audience */}
          <div className="mb-5">
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-3">
              Target Audience
            </label>
            <div className="space-y-2">
              {TARGETS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTarget(t.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${target === t.value ? "border-[#39FF88]/40 bg-[#39FF88]/5" : "border-white/5 bg-[#0B0B0F] hover:border-white/10"}`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <div
                      className={`text-sm font-medium ${target === t.value ? "text-[#39FF88]" : "text-white"}`}
                    >
                      {t.label}
                    </div>
                    <div className="text-[#6B6B6B] text-xs">{t.desc}</div>
                  </div>
                  {target === t.value && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-[#39FF88] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="mb-4">
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-2">
              Notification Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50 capitalize"
            >
              {NOTIF_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-2">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50 placeholder-[#3A3A3A]"
            />
          </div>

          {/* Message */}
          <div className="mb-5">
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write your notification message..."
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50 placeholder-[#3A3A3A] resize-none"
            />
          </div>

          {sent && (
            <div className="bg-[#39FF88]/10 border border-[#39FF88]/20 rounded-xl px-4 py-3 text-[#39FF88] text-sm text-center mb-4">
              ✓ Sent to {sent.sent} users successfully!
            </div>
          )}

          <button
            onClick={() => sendMutation.mutate()}
            disabled={!title || !message || sendMutation.isPending}
            className="w-full py-3 rounded-xl text-black text-sm font-bold disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #39FF88, #00D1FF)" }}
          >
            {sendMutation.isPending
              ? "Sending..."
              : `🚀 Send to ${TARGETS.find((t) => t.value === target)?.label}`}
          </button>
        </div>

        {/* Preview + History */}
        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5">
            <h3 className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider mb-4">
              Preview
            </h3>
            <div className="bg-[#0B0B0F] rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#39FF88]/20 flex items-center justify-center text-sm">
                  C
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">
                    {title || "Notification Title"}
                  </div>
                  <div className="text-[#6B6B6B] text-xs">CreatorHub · now</div>
                </div>
              </div>
              <p className="text-[#A0A0A0] text-sm">
                {message || "Your notification message will appear here..."}
              </p>
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-[#15151C] border border-white/5 rounded-2xl p-5">
            <h3 className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider mb-4">
              Recent Sends
            </h3>
            {(logsData?.logs || []).length === 0 ? (
              <div className="text-center py-6 text-[#6B6B6B] text-sm">
                No notifications sent yet
              </div>
            ) : (
              <div className="space-y-2">
                {logsData.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-[#0B0B0F] rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-medium truncate">
                        {log.details?.title || "Notification"}
                      </div>
                      <div className="text-[#6B6B6B] text-[11px]">
                        To: {log.details?.target} · {log.details?.count} users
                      </div>
                    </div>
                    <div className="text-[#6B6B6B] text-[11px] flex-shrink-0">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
