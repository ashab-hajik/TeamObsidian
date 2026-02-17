import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import AppLogo from "./AppLogo";
import AppFooter from "./AppFooter";
import { useApp } from "../context/AppContext";

const navLinks = [
  {
    to: "/home",
    label: "Browse",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    to: "/upload",
    label: "Upload",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 21V9" />
        <path d="m7 14 5-5 5 5" />
        <rect x="3" y="3" width="18" height="4" rx="1" />
      </svg>
    ),
  },
  {
    to: "/leaderboard",
    label: "Leaderboard",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 20V10" />
        <path d="M12 20V4" />
        <path d="M18 20v-7" />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    to: "/about",
    label: "About Us",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <path d="M12 7h.01" />
      </svg>
    ),
  },
];

export default function MainLayout() {
  const { currentUser, logout, darkMode, setDarkMode, examMode, setExamMode } = useApp();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const onLogout = () => {
    logout();
    navigate("/auth");
  };

  useEffect(() => {
    const closeOnOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("click", closeOnOutside);
    return () => window.removeEventListener("click", closeOnOutside);
  }, []);

  return (
    <div className={`min-h-screen bg-mesh transition-colors duration-300 ${examMode ? "bg-slate-100 dark:bg-slate-950" : ""}`}>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <motion.button
            type="button"
            onClick={() => navigate("/home")}
            whileHover={{ y: -1, scale: 1.01 }}
            className="text-left"
          >
            <AppLogo />
          </motion.button>

          <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
            <button
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow ${
                examMode
                  ? "border-indigo-300 bg-gradient-to-r from-indigo-100 to-cyan-100 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200"
                  : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
              onClick={() => setExamMode(!examMode)}
            >
              Exam Mode: {examMode ? "ON" : "OFF"}
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition duration-200 hover:-translate-y-0.5 hover:text-indigo-600 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
            >
              {darkMode ? "LIGHT" : "DARK"}
            </button>
            <button
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-indigo-700 transition duration-200 hover:-translate-y-0.5 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-200"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Open profile menu"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 text-white">
                {(currentUser?.name ?? "U").slice(0, 1).toUpperCase()}
              </span>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-4 top-16 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.role === "ADMIN" ? "Admin" : "Student"}</p>
                  </div>
                  <button
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/my-resources");
                    }}
                  >
                    My Resources
                  </button>
                  {currentUser?.role === "ADMIN" && (
                    <button
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/admin");
                      }}
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {!examMode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 p-4 text-white shadow-soft"
          >
            <p className="text-sm opacity-90">Logged in as</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-base font-bold">
                  {(currentUser?.name ?? "U").slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <h2 className="text-xl font-semibold">{currentUser?.name}</h2>
                  <p className="text-sm opacity-90">{currentUser?.college} | Sem {currentUser?.semester}</p>
                </div>
              </div>
              <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]">
                {currentUser?.role === "ADMIN" ? "Admin" : "Student"}
              </span>
            </div>
          </motion.div>
        )}

        <nav className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-soft dark:bg-slate-900 sm:grid-cols-5">
          {navLinks.map((link) => {
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `group relative flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="inline-flex h-5 w-5 items-center justify-center">{link.icon}</span> {link.label}
                    {!isActive && (
                      <span className="absolute bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-indigo-500 transition-all duration-200 group-hover:w-8" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {currentUser?.role === "ADMIN" && !examMode && (
          <button
            className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200"
            onClick={() => navigate("/admin")}
          >
            Open Admin Dashboard
          </button>
        )}

        <main>
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
