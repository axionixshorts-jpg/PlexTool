"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

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

const SETTING_CONFIGS = [
  {
    key: "min_withdrawal",
    label: "Minimum Withdrawal ($)",
    type: "number",
    desc: "Minimum amount creators can withdraw",
    icon: "💸",
  },
  {
    key: "platform_fee",
    label: "Platform Fee (%)",
    type: "number",
    desc: "Percentage fee taken from campaign rewards",
    icon: "💰",
  },
  {
    key: "referral_reward",
    label: "Referral Reward ($)",
    type: "number",
    desc: "Amount paid per successful referral",
    icon: "🎁",
  },
  {
    key: "max_campaigns_per_creator",
    label: "Max Campaign Joins",
    type: "number",
    desc: "Max campaigns a creator can join simultaneously",
    icon: "📢",
  },
  {
    key: "auto_approve_threshold",
    label: "Auto-Approve Threshold ($)",
    type: "number",
    desc: "Withdrawals under this amount auto-approve",
    icon: "⚡",
  },
  {
    key: "fraud_score_threshold",
    label: "Fraud Score Threshold",
    type: "number",
    desc: "Score above this flags user as suspicious",
    icon: "🚨",
  },
  {
    key: "withdrawal_auto_approve",
    label: "Auto-Approve Withdrawals",
    type: "toggle",
    desc: "Automatically approve small withdrawals",
    icon: "✅",
  },
  {
    key: "maintenance_mode",
    label: "Maintenance Mode",
    type: "toggle",
    desc: "Lock app for users during maintenance",
    icon: "🔧",
  },
];

function SettingRow({ config, value, onChange }) {
  if (config.type === "toggle") {
    const active = value === "true" || value === true;
    return (
      <div className="flex items-center justify-between p-4 bg-[#0B0B0F] rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">{config.icon}</span>
          <div>
            <div className="text-white text-sm font-medium">{config.label}</div>
            <div className="text-[#6B6B6B] text-xs">{config.desc}</div>
          </div>
        </div>
        <div
          onClick={() => onChange(!active ? "true" : "false")}
          className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${active ? "bg-[#39FF88]" : "bg-[#3A3A3A]"}`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-7" : "translate-x-1"}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#0B0B0F] rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{config.icon}</span>
        <div>
          <div className="text-white text-sm font-medium">{config.label}</div>
          <div className="text-[#6B6B6B] text-xs">{config.desc}</div>
        </div>
      </div>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#15151C] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
      />
    </div>
  );
}

export default function SettingsPage() {
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => adminFetch("/api/admin/settings"),
  });

  useEffect(() => {
    if (data?.settings) {
      const initial = {};
      for (const [key, s] of Object.entries(data.settings))
        initial[key] = s.value;
      setValues(initial);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ updates: values }),
      }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-white text-2xl font-bold mb-6">Settings</h1>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#15151C] rounded-2xl h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Platform Settings</h1>
          <p className="text-[#6B6B6B] text-sm mt-0.5">
            Control platform-wide configuration
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="px-5 py-2.5 rounded-xl text-black text-sm font-bold disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #39FF88, #00D1FF)" }}
        >
          {saveMutation.isPending ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {saved && (
        <div className="bg-[#39FF88]/10 border border-[#39FF88]/20 rounded-xl px-4 py-3 text-[#39FF88] text-sm text-center mb-4">
          ✓ Settings saved successfully!
        </div>
      )}

      <div className="space-y-3">
        {SETTING_CONFIGS.map((config) => (
          <SettingRow
            key={config.key}
            config={config}
            value={values[config.key]}
            onChange={(v) =>
              setValues((prev) => ({ ...prev, [config.key]: v }))
            }
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-[#FF4D67]/5 border border-[#FF4D67]/15 rounded-2xl">
        <h3 className="text-[#FF4D67] text-sm font-semibold mb-2">
          ⚠️ Danger Zone
        </h3>
        <p className="text-[#6B6B6B] text-xs mb-3">
          Irreversible actions — proceed with extreme caution
        </p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-xl bg-[#FF4D67]/10 text-[#FF4D67] text-sm font-medium border border-[#FF4D67]/20"
            onClick={() =>
              alert("This would clear platform cache in production")
            }
          >
            Clear Cache
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-[#FF4D67]/10 text-[#FF4D67] text-sm font-medium border border-[#FF4D67]/20"
            onClick={() =>
              alert("This would force-expire all user sessions in production")
            }
          >
            Force Logout All
          </button>
        </div>
      </div>
    </div>
  );
}
