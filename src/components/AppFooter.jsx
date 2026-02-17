import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const mainLinks = [
  { to: "/home", label: "Home" },
  { to: "/upload", label: "Upload" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/profile", label: "Profile" },
];

const academicLinks = [
  { to: "#", label: "Privacy Policy" },
  { to: "#", label: "Terms" },
];

const socialLinks = [
  {
    label: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.3 3.3 0 0 0-.9-2.4c3-.3 6-1.5 6-7a5.4 5.4 0 0 0-1.5-3.7 5 5 0 0 0-.1-3.7s-1.2-.4-3.8 1.4a13 13 0 0 0-7 0C6.2.9 5 1.3 5 1.3A5 5 0 0 0 4.9 5a5.4 5.4 0 0 0-1.5 3.7c0 5.5 3 6.7 6 7a3.3 3.3 0 0 0-.9 2.4V22" />
      </svg>
    ),
    classes: "text-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:text-slate-100",
  },
  {
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="8" width="4" height="12" rx="1" />
        <path d="M5 5v.01" />
        <path d="M11 20v-7a3 3 0 0 1 6 0v7" />
        <path d="M11 13v-5h4" />
      </svg>
    ),
    classes: "text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:text-blue-300",
  },
  {
    label: "X",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m4 4 16 16" />
        <path d="M20 4 4 20" />
      </svg>
    ),
    classes: "text-teal-700 hover:border-teal-300 hover:bg-teal-50 dark:text-teal-300",
  },
];

export default function AppFooter() {
  return (
    <footer className="mt-8">
      <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 p-5 shadow-soft dark:border-slate-700 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900">
        <div className="mb-5 rounded-2xl border border-white/70 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 p-4 text-white shadow-lg shadow-indigo-500/15">
          <p className="text-xs uppercase tracking-[0.14em] opacity-90">Campus Share Community</p>
          <p className="mt-1 text-sm">We help students plan smarter, not just find notes.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
              Campus Share
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Academic Resource Hub</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              A student-led platform for sharing reliable notes, exam prep packs, and collaborative learning resources.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-slate-200/70 py-2 dark:border-slate-700/80 md:border-y-0 md:border-l md:border-r md:px-4 md:py-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Quick Links</p>
              <div className="mt-2 space-y-1.5">
                {mainLinks.map((link) => (
                  <FooterLink key={link.to} to={link.to}>
                    {link.label}
                  </FooterLink>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Academic</p>
              <div className="mt-2 space-y-1.5">
                {academicLinks.map((link) => (
                  <FooterLink key={link.label} to={link.to}>
                    {link.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Contact</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
              hello@campusshare.demo
            </p>
            <div className="mt-3 flex gap-2">
              {socialLinks.map((item) => (
                <motion.button
                  key={item.label}
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={`rounded-full border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold transition dark:border-slate-700 dark:bg-slate-900 ${item.classes}`}
                  title={item.label}
                  type="button"
                >
                  {item.icon}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-indigo-100 bg-white/70 p-4 dark:border-indigo-900 dark:bg-slate-900/60">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Didn't find what you were looking for?</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="Drop your email for requested resources"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-300 dark:border-slate-700 dark:bg-slate-900"
            />
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow"
              type="button"
            >
              Notify Me
            </motion.button>
          </div>
        </div>

        <p className="mt-4 border-t border-slate-200/70 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          © 2026 Campus Share. Built for collaborative academic growth.
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  if (to === "#") {
    return (
      <button
        type="button"
        className="block text-sm text-slate-600 transition hover:translate-x-0.5 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className="block text-sm text-slate-600 transition hover:translate-x-0.5 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
    >
      {children}
    </Link>
  );
}
