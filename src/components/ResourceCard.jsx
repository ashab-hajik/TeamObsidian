import { motion } from "framer-motion";
import RatingStars from "./RatingStars";

const subjectAccents = {
  "Data Structures": "from-cyan-500 to-blue-600",
  Algorithms: "from-violet-500 to-indigo-600",
  DBMS: "from-emerald-500 to-teal-600",
  "Operating Systems": "from-orange-500 to-amber-600",
  "Computer Networks": "from-sky-500 to-indigo-500",
  "Web Development": "from-fuchsia-500 to-pink-600",
  "AI / ML": "from-indigo-500 to-violet-600",
  "Software Engineering": "from-slate-500 to-slate-700",
  "Cloud Computing": "from-teal-500 to-cyan-600",
};

export default function ResourceCard({ resource, owner, canAccess, onView, onDownload, className = "" }) {
  const accent = subjectAccents[resource.subject] ?? "from-indigo-500 to-blue-600";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.012 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft transition hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800/70 ${className}`}
    >
      <div className={`h-1.5 rounded-full bg-gradient-to-r ${accent}`} />

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">{resource.title}</h3>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{resource.subject}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {resource.type}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Semester {resource.semester}
        </span>
        <span className={`rounded-full px-2 py-1 font-semibold ${resource.privacy === "Private" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"}`}>
          {resource.privacy === "Private" ? "Private" : "Public"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {resource.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            #{tag}
          </span>
        ))}
        {resource.isTopRated && (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
            Top Rated
          </span>
        )}
        {resource.isExamOriented && (
          <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
            Exam Oriented
          </span>
        )}
        {resource.featured && (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
            Featured
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">{resource.privacy === "Private" ? "College Restricted" : "Open Access"}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">by {owner?.name ?? "Unknown"}</p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <RatingStars value={Math.round(resource.averageRating)} size={17} />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {resource.averageRating.toFixed(1)}
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{resource.ratingCount} reviews</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onView}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
            canAccess
              ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 text-white shadow hover:-translate-y-0.5 hover:brightness-105"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            {canAccess ? "View" : "Restricted"}
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: canAccess ? 0.97 : 1 }}
          onClick={() => canAccess && onDownload?.()}
          disabled={!canAccess}
          title={!canAccess ? "Private resource: only your college can download" : "Download Resource"}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
            canAccess
              ? "border-indigo-200 text-indigo-700 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-teal-950/30"
              : "cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v11" />
              <path d="m7 10 5 5 5-5" />
              <path d="M4 20h16" />
            </svg>
            Download
          </span>
        </motion.button>
      </div>
    </motion.article>
  );
}
