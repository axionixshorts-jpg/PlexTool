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

function Avatar({ name, url }) {
  if (url)
    return (
      <img
        src={url}
        alt=""
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
      />
    );
  return (
    <div className="w-9 h-9 rounded-full bg-[#39FF88]/15 flex items-center justify-center text-[#39FF88] text-sm font-bold flex-shrink-0">
      {(name || "U").charAt(0).toUpperCase()}
    </div>
  );
}

function WalletModal({ user, onClose }) {
  const [action, setAction] = useState("add_balance");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const qc = useQueryClient();

  const submit = async () => {
    setLoading(true);
    const res = await adminFetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify({ action, amount: parseFloat(amount), description }),
    });
    setLoading(false);
    if (res.success) {
      setMsg("Done!");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setTimeout(onClose, 1000);
    } else setMsg(res.error || "Error");
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#15151C] border border-white/8 rounded-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white text-lg font-bold mb-1">Wallet Management</h3>
        <p className="text-[#6B6B6B] text-sm mb-5">
          {user.name} · Current: ${parseFloat(user.balance || 0).toFixed(2)}
        </p>
        <div className="space-y-3 mb-4">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none"
          >
            <option value="add_balance">Add Balance (Credit)</option>
            <option value="deduct_balance">Deduct Balance (Debit)</option>
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount ($)"
            className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Reason / description"
            className="w-full bg-[#0B0B0F] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none"
          />
        </div>
        {msg && (
          <p className="text-[#39FF88] text-sm text-center mb-3">{msg}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#1E1E2A] text-[#A0A0A0] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!amount || loading}
            className="flex-1 py-2.5 rounded-xl text-black text-sm font-bold disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #39FF88, #00D1FF)" }}
          >
            {loading ? "..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [walletUser, setWalletUser] = useState(null);
  const [confirmBan, setConfirmBan] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter],
    queryFn: () =>
      adminFetch(
        `/api/admin/users?search=${search}&role=${roleFilter}&limit=50`,
      ),
  });

  const banMutation = useMutation({
    mutationFn: (id) =>
      adminFetch(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ action: "ban" }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setConfirmBan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      adminFetch(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const users = data?.users || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Users & Creators</h1>
          <p className="text-[#6B6B6B] text-sm mt-0.5">
            {data?.total || 0} registered users
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 bg-[#15151C] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#39FF88]/50 placeholder-[#6B6B6B]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#15151C] border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm outline-none"
        >
          <option value="">All Roles</option>
          <option value="creator">Creators</option>
          <option value="brand">Brands</option>
        </select>
      </div>

      <div className="bg-[#15151C] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  "User",
                  "Role",
                  "Campaigns",
                  "Submissions",
                  "Balance",
                  "Lifetime Earned",
                  "Joined",
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
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-white/3">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 bg-white/5 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-[#6B6B6B] text-sm"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} url={u.avatar_url} />
                        <div>
                          <div className="text-white text-sm font-medium">
                            {u.name || "No name"}
                          </div>
                          <div className="text-[#6B6B6B] text-xs">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${u.role === "creator" ? "bg-[#00D1FF]/15 text-[#00D1FF]" : "bg-[#FFB547]/15 text-[#FFB547]"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A0A0] text-sm">
                      {u.campaign_count || 0}
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A0A0] text-sm">
                      {u.submission_count || 0}
                    </td>
                    <td className="py-3.5 px-4 text-[#39FF88] text-sm font-semibold">
                      ${parseFloat(u.balance || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A0A0] text-sm">
                      ${parseFloat(u.lifetime_earnings || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6B6B] text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setWalletUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-[#39FF88]/10 text-[#39FF88] text-xs"
                        >
                          Wallet
                        </button>
                        <button
                          onClick={() => setConfirmBan(u)}
                          className="px-2.5 py-1 rounded-lg bg-[#FFB547]/10 text-[#FFB547] text-xs"
                        >
                          Ban
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete user?"))
                              deleteMutation.mutate(u.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FF4D67]/10 text-[#FF4D67] text-xs"
                        >
                          Del
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

      {walletUser && (
        <WalletModal user={walletUser} onClose={() => setWalletUser(null)} />
      )}

      {confirmBan && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmBan(null)}
        >
          <div
            className="bg-[#15151C] border border-white/8 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl text-center mb-3">🚫</div>
            <h3 className="text-white text-lg font-bold text-center mb-2">
              Ban User?
            </h3>
            <p className="text-[#A0A0A0] text-sm text-center mb-5">
              Ban <strong>{confirmBan.name}</strong>? They will lose access to
              platform features.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBan(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#1E1E2A] text-[#A0A0A0] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => banMutation.mutate(confirmBan.id)}
                className="flex-1 py-2.5 rounded-xl bg-[#FF4D67]/20 text-[#FF4D67] text-sm font-semibold border border-[#FF4D67]/30"
              >
                Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
