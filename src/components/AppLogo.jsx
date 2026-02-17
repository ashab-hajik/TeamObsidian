import { motion } from "framer-motion";

export default function AppLogo({ className = "", compact = false, light = false }) {
  const toneText = light ? "text-white" : "text-slate-900 dark:text-white";
  const toneSub = light ? "text-white/80" : "text-indigo-600 dark:text-indigo-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -1 }}
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <motion.span
        whileHover={{ rotate: 3, scale: 1.03 }}
        transition={{ duration: 0.25 }}
        className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/30"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
        <span className="relative">CS</span>
      </motion.span>

      {!compact && (
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${toneSub}`}>Campus Share</p>
          <p className={`text-base font-bold leading-tight ${toneText}`}>Academic Resource Hub</p>
        </div>
      )}
    </motion.div>
  );
}
