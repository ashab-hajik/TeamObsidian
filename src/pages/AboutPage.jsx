import { motion } from "framer-motion";
import AppLogo from "../components/AppLogo";

const pillars = [
  {
    title: "Student-driven learning",
    description: "Peer-created notes and practical resources help students learn from real campus experience.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4 3 8l9 4 9-4-9-4Z" />
        <path d="M5 10.5V15l7 3 7-3v-4.5" />
      </svg>
    ),
  },
  {
    title: "Secure resource sharing",
    description: "Access-aware sharing keeps private campus material protected while enabling wider collaboration.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </svg>
    ),
  },
  {
    title: "Exam-focused content",
    description: "Top-rated, exam-oriented notes and packs help students revise smarter under real deadlines.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 3h8" />
        <path d="M9 3v3" />
        <path d="M15 3v3" />
        <rect x="4" y="6" width="16" height="15" rx="2" />
        <path d="M8 11h8" />
      </svg>
    ),
  },
  {
    title: "Built for collaboration",
    description: "Ratings, reviews, and shared insights create an active learning loop across the student community.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M2.5 20c.8-3 3.2-5 5.5-5s4.7 2 5.5 5" />
        <path d="M10.5 20c.7-2.4 2.5-4 5-4 2 0 4 1.1 5 4" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 p-6 text-white shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(16,185,129,0.18),transparent_36%)]" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative"
        >
          <AppLogo light className="mb-4" />
          <h2 className="text-3xl font-bold">About Us</h2>
          <p className="mt-3 max-w-3xl text-sm text-blue-100 sm:text-base">
            This platform enables students to share academic resources, collaborate, and learn more effectively within their campus and beyond.
          </p>
        </motion.div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {pillars.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white shadow">
              {item.icon}
            </span>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
