"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});
const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "⬛", emoji: "📊" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "📢" },
  { href: "/admin/submissions", label: "Submissions", icon: "📋" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: "💸" },
  { href: "/admin/banners", label: "Banners", icon: "🖼️" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  { href: "/admin/audit", label: "Audit Logs", icon: "🔍" },
];

function NavLink({ item, collapsed }) {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const active = path === item.href || path.startsWith(item.href + "/");
  return (
    <a
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium mb-0.5 transition-all duration-150 no-underline
        ${
          active
            ? "bg-[#39FF88]/10 text-[#39FF88]"
            : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
        }`}
    >
      <span className="text-base flex-shrink-0 w-5 text-center">
        {item.icon}
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
      {active && !collapsed && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#39FF88]" />
      )}
    </a>
  );
}

function Sidebar({ collapsed, setCollapsed, onLogout }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#0F0F17] border-r border-white/5 flex flex-col z-30 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
    >
      <div className="flex items-center justify-between px-3 h-16 border-b border-white/5 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#39FF88]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#39FF88] text-base font-black">C</span>
            </div>
            <div>
              <div className="text-white text-sm font-bold leading-tight">
                CreatorHub
              </div>
              <div className="text-[#39FF88] text-[9px] font-bold tracking-widest uppercase">
                Super Admin
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-[#39FF88]/20 flex items-center justify-center mx-auto">
            <span className="text-[#39FF88] text-base font-black">C</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-[#6B6B6B] hover:text-white p-1 ml-1 text-xs"
          >
            ◀
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="text-[#6B6B6B] hover:text-white p-2 text-xs border-b border-white/5 text-center"
        >
          ▶
        </button>
      )}

      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="p-3 border-t border-white/5 flex-shrink-0">
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#FF4D67] hover:bg-[#FF4D67]/10 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <span className="text-base">🚪</span>
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}

function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isAuthPage = path === "/admin" || path === "/admin/login";

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }
    fetch("/api/admin/auth", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.admin) {
          setAdmin(data.admin);
          setLoading(false);
        } else {
          localStorage.removeItem("admin_token");
          window.location.href = "/admin/login";
        }
      })
      .catch(() => {
        window.location.href = "/admin/login";
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  };

  if (loading && !isAuthPage) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#39FF88] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#A0A0A0] text-sm font-medium">
            Loading admin panel...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0B0B0F]">{children}</div>;
  }

  return (
    <AdminContext.Provider
      value={{
        admin,
        logout,
        token:
          typeof window !== "undefined"
            ? localStorage.getItem("admin_token")
            : null,
      }}
    >
      <div className="min-h-screen bg-[#0B0B0F] text-white flex">
        <div className="hidden md:block">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onLogout={logout}
          />
        </div>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-50 w-60">
              <Sidebar
                collapsed={false}
                setCollapsed={() => {}}
                onLogout={logout}
              />
            </div>
          </div>
        )}

        <main
          className={`flex-1 min-h-screen transition-all duration-300 overflow-x-hidden ${collapsed ? "md:ml-16" : "md:ml-60"}`}
        >
          <div className="md:hidden flex items-center gap-3 px-4 h-14 bg-[#0F0F17] border-b border-white/5 sticky top-0 z-20">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="text-[#A0A0A0] text-xl"
            >
              ☰
            </button>
            <span className="text-white text-sm font-bold">
              CreatorHub Admin
            </span>
          </div>
          <div className="p-4 md:p-6 lg:p-8 max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}

export default function AdminLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>{children}</AdminProvider>
    </QueryClientProvider>
  );
}
