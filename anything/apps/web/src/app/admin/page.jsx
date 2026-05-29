"use client";
import { useEffect } from "react";

export default function AdminRoot() {
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    window.location.href = token ? "/admin/dashboard" : "/admin/login";
  }, []);
  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
      <div
        className="w-8 h-8 border-2 border-[#39FF88] border-t-transparent rounded-full"
        style={{ animation: "spin 0.8s linear infinite" }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
