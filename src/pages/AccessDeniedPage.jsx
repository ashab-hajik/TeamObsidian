import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function AccessDeniedPage() {
  const { pushToast } = useApp();

  useEffect(() => {
    pushToast("Access denied: you are not authorized for this section.", "error");
  }, [pushToast]);

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-soft dark:border-rose-800 dark:bg-rose-950/30"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-300">Authorization</p>
        <h2 className="mt-2 text-3xl font-bold text-rose-700 dark:text-rose-200">Access Denied</h2>
        <p className="mt-2 text-sm text-rose-700/80 dark:text-rose-200/80">
          Your current role does not have permission to view this route.
        </p>
        <Link
          to="/home"
          className="mt-5 inline-block rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
