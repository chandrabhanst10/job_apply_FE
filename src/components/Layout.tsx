import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { 
  LayoutDashboard, 
  FileText,
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Compass,
  Sliders,
  Linkedin,
  Briefcase,
  Chrome,
  ShieldCheck,
  Code
} from "lucide-react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logoutUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    const root = window.document.documentElement;
    if (saved === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    return saved;
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    const root = window.document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("theme", nextTheme);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "LinkedIn Auto-Pilot", path: "/auto-apply/linkedin", icon: Linkedin },
    { name: "Naukri Auto-Pilot", path: "/auto-apply/naukri", icon: Briefcase },
    { name: "Browser Connections", path: "/browser-connections", icon: Chrome },
    { name: "AI Configuration", path: "/ai-config", icon: Sliders },
    { name: "My Resumes", path: "/resumes", icon: FileText },
    { name: "Developer API Keys", path: "/developer-keys", icon: Code },
    { name: "Trust & Compliance", path: "/trust-center", icon: ShieldCheck },
    { name: "Settings", path: "/settings", icon: Settings },
    ...(user?.role === "admin" || user?.role === "super_admin"
      ? [{ name: "Admin Console", path: "/admin", icon: ShieldCheck }]
      : [])
  ];

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/40 z-30 transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-200/80 dark:border-slate-800/40">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Compass className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent tracking-wide">
              JobAutoPilot
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "" : "opacity-80"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile & controls */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/40 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <img
              src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`}
              alt="avatar"
              className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover shadow"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200"
          >
            <span className="flex items-center gap-3">
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/40 flex items-center justify-between px-4 z-40">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Compass className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-base bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            JobAutoPilot
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg"
          >
            {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          <div className="relative flex flex-col w-80 max-w-sm bg-white dark:bg-slate-900 h-full p-6 shadow-xl z-50 animate-slide-in">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-lg">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`}
                  alt="avatar"
                  className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-200"
              >
                <LogOut className="h-4.5 w-4.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col md:pl-64 pt-16 md:pt-0">
        <main className="flex-1 px-4 py-8 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

    </div>
  );
};
