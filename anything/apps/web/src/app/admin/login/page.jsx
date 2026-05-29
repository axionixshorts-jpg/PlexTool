"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("admin_token", data.token);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(57,255,136,0.06) 0%, transparent 60%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl bg-[#39FF88]/15 border border-[#39FF88]/20 flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: "0 0 30px rgba(57,255,136,0.15)" }}
          >
            <span className="text-[#39FF88] text-3xl font-black">C</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Super Admin Panel
          </h1>
          <p className="text-[#6B6B6B] text-sm mt-1">
            Restricted access. Authorized personnel only.
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-[#15151C] border border-white/5 rounded-2xl p-6"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full bg-[#0B0B0F] border border-white/8 text-white placeholder-[#3A3A3A] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#39FF88]/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0B0B0F] border border-white/8 text-white placeholder-[#3A3A3A] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#39FF88]/50 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-white text-xs"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#FF4D67]/10 border border-[#FF4D67]/20 rounded-xl px-4 py-3 text-[#FF4D67] text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-sm text-black transition-opacity disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #39FF88, #00D1FF)",
              }}
            >
              {loading ? "Authenticating..." : "Access Admin Panel"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[#3A3A3A] text-xs">
              🔒 Secured with JWT authentication
            </p>
          </div>
        </div>

        <p className="text-center text-[#3A3A3A] text-xs mt-6">
          CreatorHub © 2026 · All rights reserved
        </p>
      </div>
    </div>
  );
}
