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
    active: "bg-[#39FF88]/15 text-[#39FF88]",
    pending: "bg-[#FFB547]/15 text-[#FFB547]",
    paused: "bg-[#6B6B6B]/15 text-[#6B6B6B]",
    rejected: "bg-[#FF4D67]/15 text-[#FF4D67]",
    completed: "bg-[#00D1FF]/15 text-[#00D1FF]",
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

const platforms = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitch",
  "Twitter",
  "Facebook",
];
const categories = [
  "Fashion",
  "Technology",
  "Health & Fitness",
  "Food & Cooking",
  "Gaming",
  "Beauty",
  "Travel",
  "Lifestyle",
  "Education",
  "Entertainment",
];

function CampaignModal({ campaign, onClose, onSave }) {
  const [form, setForm] = useState(
    campaign || {
      title: "",
      brand_name: "",
      description: "",
      platform: "Instagram",
      category: "Fashion",
      reward_amount: "",
      rules: "",
      requirements: "",
      status: "active",
      featured: false,
      trending: false,
      max_participants: "",
      hero_image: "",
      brand_logo: "",
    },
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#15151C] border border-white/8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#15151C] border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">
            {campaign ? "Edit Campaign" : "Create Campaign"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6B6B6B] hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["title", "Campaign Title"],
            ["brand_name", "Brand Name"],
            ["brand_logo", "Brand Logo URL"],
            ["hero_image", "Hero Image URL"],
          ].map(([k, l]) => (
            <div
              key={k}
              className={
                k === "title" || k === "hero_image" ? "sm:col-span-2" : ""
              }
            >
              <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
                {l}
              </label>
              <input
                value={form[k] || ""}
                onChange={(e) => set(k, e.target.value)}
                className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
              />
            </div>
          ))}
          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Platform
            </label>
            <select
              value={form.platform}
              onChange={(e) => set("platform", e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Reward ($)
            </label>
            <input
              type="number"
              value={form.reward_amount}
              onChange={(e) => set("reward_amount", e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
            />
          </div>
          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Max Participants
            </label>
            <input
              type="number"
              value={form.max_participants}
              onChange={(e) => set("max_participants", e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
            />
          </div>
          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
            >
              {["active", "pending", "paused", "completed", "rejected"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="flex items-center gap-6">
            {[
              ["featured", "Featured"],
              ["trending", "Trending"],
            ].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => set(k, !form[k])}
                  className={`w-10 h-5 rounded-full relative transition-colors ${form[k] ? "bg-[#39FF88]" : "bg-[#3A3A3A]"}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form[k] ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </div>
                <span className="text-[#A0A0A0] text-sm">{l}</span>
              </label>
            ))}
          </div>
          <div className="sm:col-span-2">
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50 resize-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Rules
            </label>
            <textarea
              value={form.rules || ""}
              onChange={(e) => set("rules", e.target.value)}
              rows={2}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50 resize-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Requirements
            </label>
            <textarea
              value={form.requirements || ""}
              onChange={(e) => set("requirements", e.target.value)}
              rows={2}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50 resize-none"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1E1E2A] text-[#A0A0A0] text-sm font-medium hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-5 py-2.5 rounded-xl text-black text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #39FF88, #00D1FF)" }}
          >
            {campaign ? "Save Changes" : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(null); // null | 'create' | campaign obj
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-campaigns", search, statusFilter],
    queryFn: () =>
      adminFetch(
        `/api/admin/campaigns?search=${search}&status=${statusFilter}&limit=50`,
      ),
  });

  const saveMutation = useMutation({
    mutationFn: (form) => {
      if (modal?.id)
        return adminFetch(`/api/admin/campaigns/${modal.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      return adminFetch("/api/admin/campaigns", {
        method: "POST",
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      adminFetch(`/api/admin/campaigns/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setDeleteId(null);
    },
  });

  const updateStatus = (id, status) =>
    adminFetch(`/api/admin/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }).then(() => qc.invalidateQueries({ queryKey: ["admin-campaigns"] }));

  const campaigns = data?.campaigns || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Campaigns</h1>
          <p className="text-[#6B6B6B] text-sm mt-0.5">
            {data?.total || 0} total campaigns
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-black text-sm font-bold self-start sm:self-auto"
          style={{ background: "linear-gradient(135deg, #39FF88, #00D1FF)" }}
        >
          + Create Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search campaigns..."
          className="flex-1 bg-[#15151C] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50 placeholder-[#6B6B6B]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#15151C] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
        >
          <option value="">All Statuses</option>
          {["active", "pending", "paused", "rejected", "completed"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#15151C] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  "Campaign",
                  "Brand",
                  "Platform",
                  "Reward",
                  "Participants",
                  "Status",
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
              ) : campaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-[#6B6B6B] text-sm"
                  >
                    No campaigns found
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {c.brand_logo && (
                          <img
                            src={c.brand_logo}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div>
                          <div className="text-white text-sm font-medium">
                            {c.title}
                          </div>
                          <div className="text-[#6B6B6B] text-xs">
                            {c.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A0A0] text-sm">
                      {c.brand_name}
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A0A0] text-sm">
                      {c.platform}
                    </td>
                    <td className="py-3.5 px-4 text-[#39FF88] text-sm font-bold">
                      ${c.reward_amount}
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A0A0] text-sm">
                      {c.participant_count || 0}
                      {c.max_participants ? `/${c.max_participants}` : ""}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModal(c)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 text-[#A0A0A0] hover:text-white text-xs transition-colors"
                        >
                          Edit
                        </button>
                        {c.status === "active" ? (
                          <button
                            onClick={() => updateStatus(c.id, "paused")}
                            className="px-2.5 py-1 rounded-lg bg-[#FFB547]/10 text-[#FFB547] text-xs"
                          >
                            Pause
                          </button>
                        ) : c.status === "paused" ? (
                          <button
                            onClick={() => updateStatus(c.id, "active")}
                            className="px-2.5 py-1 rounded-lg bg-[#39FF88]/10 text-[#39FF88] text-xs"
                          >
                            Resume
                          </button>
                        ) : null}
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#FF4D67]/10 text-[#FF4D67] text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <CampaignModal
          campaign={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(form) => saveMutation.mutate(form)}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-[#15151C] border border-white/8 rounded-2xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl mb-3 text-center">⚠️</div>
            <h3 className="text-white text-lg font-bold text-center mb-2">
              Delete Campaign?
            </h3>
            <p className="text-[#A0A0A0] text-sm text-center mb-5">
              This action cannot be undone. All related data will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#1E1E2A] text-[#A0A0A0] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-[#FF4D67]/20 text-[#FF4D67] text-sm font-semibold border border-[#FF4D67]/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
