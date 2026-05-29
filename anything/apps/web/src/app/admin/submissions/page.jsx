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

function ReviewModal({ submission, onClose }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const action = async (status) => {
    setLoading(true);
    const res = await adminFetch(`/api/admin/submissions/${submission.id}`, {
      method: "PUT",
      body: JSON.stringify({ status, reviewer_notes: notes }),
    });
    setLoading(false);
    if (res.submission) {
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
      onClose();
    }
  };

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
          <h2 className="text-white text-lg font-bold">Review Submission</h2>
          <button
            onClick={onClose}
            className="text-[#6B6B6B] hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#0B0B0F] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Creator</span>
              <span className="text-white font-medium">
                {submission.creator_name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Campaign</span>
              <span className="text-white font-medium">
                {submission.campaign_title}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Reward</span>
              <span className="text-[#39FF88] font-bold">
                ${submission.reward_amount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Platform</span>
              <span className="text-white">{submission.platform}</span>
            </div>
          </div>

          <div>
            <p className="text-[#6B6B6B] text-xs font-semibold uppercase tracking-wider mb-2">
              Content Link
            </p>
            <a
              href={submission.content_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00D1FF] text-sm break-all hover:underline"
            >
              {submission.content_link}
            </a>
          </div>

          {submission.screenshot_url && (
            <div>
              <p className="text-[#6B6B6B] text-xs font-semibold uppercase tracking-wider mb-2">
                Screenshot Proof
              </p>
              <img
                src={submission.screenshot_url}
                alt="proof"
                className="w-full rounded-xl object-cover max-h-48"
              />
            </div>
          )}

          {submission.notes && (
            <div>
              <p className="text-[#6B6B6B] text-xs font-semibold uppercase tracking-wider mb-2">
                Creator Notes
              </p>
              <p className="text-[#A0A0A0] text-sm">{submission.notes}</p>
            </div>
          )}

          <div>
            <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-2">
              Reviewer Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Leave feedback for the creator..."
              className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => action("rejected")}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#FF4D67]/15 text-[#FF4D67] text-sm font-semibold border border-[#FF4D67]/20 disabled:opacity-50"
          >
            ✗ Reject
          </button>
          <button
            onClick={() => action("approved")}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-black text-sm font-bold disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #39FF88, #00D1FF)" }}
          >
            {loading ? "..." : "✓ Approve & Pay"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubmissionsPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [reviewItem, setReviewItem] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-submissions", statusFilter, search],
    queryFn: () =>
      adminFetch(
        `/api/admin/submissions?status=${statusFilter}&search=${search}&limit=50`,
      ),
    refetchInterval: 30000,
  });

  const submissions = data?.submissions || [];
  const tabs = [
    { label: "Pending", value: "pending", color: "#FFB547" },
    { label: "Approved", value: "approved", color: "#39FF88" },
    { label: "Rejected", value: "rejected", color: "#FF4D67" },
    { label: "All", value: "", color: "#A0A0A0" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">
            Submission Moderation
          </h1>
          <p className="text-[#6B6B6B] text-sm mt-0.5">
            {data?.total || 0} total submissions
          </p>
        </div>
        {statusFilter === "pending" && submissions.length > 0 && (
          <div className="flex items-center gap-2 bg-[#FFB547]/10 border border-[#FFB547]/20 rounded-xl px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-[#FFB547]" />
            <span className="text-[#FFB547] text-xs font-semibold">
              {submissions.length} awaiting review
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
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
                    color: "#000",
                  }
                : {}
            }
          >
            {tab.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="ml-auto bg-[#15151C] border border-white/8 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-[#39FF88]/50 placeholder-[#6B6B6B]"
        />
      </div>

      <div className="bg-[#15151C] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  "Creator",
                  "Campaign",
                  "Platform",
                  "Reward",
                  "Status",
                  "Submitted",
                  "Action",
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
              ) : submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-[#6B6B6B] text-sm"
                  >
                    No submissions found
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="text-white text-sm font-medium">
                        {s.creator_name}
                      </div>
                      <div className="text-[#6B6B6B] text-xs">
                        {s.creator_email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A0A0] text-sm max-w-[160px]">
                      <div className="truncate">{s.campaign_title}</div>
                      <div className="text-[#6B6B6B] text-xs">
                        {s.brand_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A0A0] text-sm">
                      {s.platform}
                    </td>
                    <td className="py-3.5 px-4 text-[#39FF88] text-sm font-bold">
                      ${s.reward_amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6B6B] text-xs">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setReviewItem(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black"
                        style={{
                          background:
                            "linear-gradient(135deg, #39FF88, #00D1FF)",
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewItem && (
        <ReviewModal
          submission={reviewItem}
          onClose={() => setReviewItem(null)}
        />
      )}
    </div>
  );
}
