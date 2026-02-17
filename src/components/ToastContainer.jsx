import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useApp } from "../context/AppContext";

const typeStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200",
  error: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-200",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        removeToast(toast.id);
      }, 2400)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, removeToast]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className={`pointer-events-auto rounded-xl border px-3 py-2 text-sm font-medium shadow-soft ${typeStyles[toast.type] ?? typeStyles.info}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p>{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-xs font-semibold opacity-80 transition hover:opacity-100"
              >
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
