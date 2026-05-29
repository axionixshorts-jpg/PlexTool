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

const BANNER_TYPES = [
  "promotional",
  "featured_campaign",
  "referral",
  "announcement",
  "trending",
  "seasonal",
];

function BannerModal({ banner, onClose, onSave }) {
  const [form, setForm] = useState(
    banner || {
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      banner_type: "promotional",
      priority: 0,
      is_active: true,
    },
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#15151C] border border-white/8 rounded-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">
            {banner ? "Edit Banner" : "Create Banner"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6B6B6B] hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
            />
          </div>
          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Subtitle
            </label>
            <input
              value={form.subtitle || ""}
              onChange={(e) => set("subtitle", e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
            />
          </div>
          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Image URL
            </label>
            <input
              value={form.image_url || ""}
              onChange={(e) => set("image_url", e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
            />
          </div>
          {form.image_url && (
            <img
              src={form.image_url}
              alt="preview"
              className="w-full rounded-xl object-cover h-32"
              onError={() => {}}
            />
          )}
          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Link URL (optional)
            </label>
            <input
              value={form.link_url || ""}
              onChange={(e) => set("link_url", e.target.value)}
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
                Type
              </label>
              <select
                value={form.banner_type}
                onChange={(e) => set("banner_type", e.target.value)}
                className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none"
              >
                {BANNER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-1.5">
                Priority
              </label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => set("priority", parseInt(e.target.value))}
                className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set("is_active", !form.is_active)}
              className={`w-10 h-5 rounded-full relative transition-colors ${form.is_active ? "bg-[#39FF88]" : "bg-[#3A3A3A]"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </div>
            <span className="text-white text-sm">Active (visible in app)</span>
          </label>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1E1E2A] text-[#A0A0A0] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-5 py-2.5 rounded-xl text-black text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #39FF88, #00D1FF)" }}
          >
            {banner ? "Save Changes" : "Create Banner"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BannersPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => adminFetch("/api/admin/banners"),
  });

  const saveMutation = useMutation({
    mutationFn: (form) => {
      if (modal?.id)
        return adminFetch(`/api/admin/banners/${modal.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      return adminFetch("/api/admin/banners", {
        method: "POST",
        body: JSON.stringify(form),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      setModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      adminFetch(`/api/admin/banners/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) =>
      adminFetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  const banners = data?.banners || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Banner Management</h1>
          <p className="text-[#6B6B6B] text-sm mt-0.5">
            {banners.filter((b) => b.is_active).length} active banners
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="px-5 py-2.5 rounded-xl text-black text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #39FF88, #00D1FF)" }}
        >
          + Add Banner
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[#15151C] border border-white/5 rounded-2xl h-56"
            />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 text-[#6B6B6B] text-sm">
          No banners yet. Create your first banner.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-[#15151C] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
            >
              {b.image_url ? (
                <div className="relative h-36">
                  <img
                    src={b.image_url}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.is_active ? "bg-[#39FF88] text-black" : "bg-[#3A3A3A] text-[#A0A0A0]"}`}
                    >
                      {b.is_active ? "LIVE" : "OFF"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-36 bg-[#0B0B0F] flex items-center justify-center">
                  <span className="text-[#3A3A3A] text-4xl">🖼️</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-white text-sm font-semibold leading-tight">
                    {b.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#6B6B6B] capitalize flex-shrink-0">
                    {b.banner_type}
                  </span>
                </div>
                {b.subtitle && (
                  <p className="text-[#6B6B6B] text-xs mb-3 line-clamp-2">
                    {b.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModal(b)}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 text-[#A0A0A0] hover:text-white text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      toggleMutation.mutate({
                        id: b.id,
                        is_active: !b.is_active,
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg text-xs ${b.is_active ? "bg-[#FFB547]/10 text-[#FFB547]" : "bg-[#39FF88]/10 text-[#39FF88]"}`}
                  >
                    {b.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete banner?"))
                        deleteMutation.mutate(b.id);
                    }}
                    className="py-1.5 px-2 rounded-lg bg-[#FF4D67]/10 text-[#FF4D67] text-xs"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <BannerModal
          banner={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(form) => saveMutation.mutate(form)}
        />
      )}
    </div>
  );
}
