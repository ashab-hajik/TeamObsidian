import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { useApp } from "../context/AppContext";

export default function LeaderboardPage() {
  const { leaderboard, currentUser } = useApp();

  const podium = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">Community</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contributor Leaderboard</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Uploads: +10 points | Each 5-star rating received: +5 points
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {podium.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`rounded-2xl border p-4 shadow-soft ${
              idx === 0
                ? "border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                : idx === 1
                  ? "border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800"
                  : "border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/30"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Rank #{idx + 1}</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{user.college}</p>
            <p className="mt-3 text-2xl font-bold text-indigo-700 dark:text-indigo-300">{user.points} pts</p>
          </motion.div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <AnimatePresence>
          {leaderboard.map((user, idx) => {
            const isMe = user.id === currentUser?.id;
            return (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.22 }}
                className={`mb-2 grid grid-cols-12 items-center gap-3 rounded-xl border px-3 py-2 last:mb-0 ${
                  isMe
                    ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40"
                    : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"
                }`}
              >
                <p className="col-span-1 text-sm font-bold text-slate-700 dark:text-slate-200">#{idx + 1}</p>
                <div className="col-span-6">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user.name} {isMe ? "(You)" : ""}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.college}</p>
                </div>
                <p className="col-span-2 text-xs text-slate-600 dark:text-slate-300">Uploads: {user.uploadCount}</p>
                <p className="col-span-2 text-xs text-slate-600 dark:text-slate-300">5 Stars: {user.fiveStars}</p>
                <p className="col-span-1 text-right text-sm font-bold text-indigo-700 dark:text-indigo-300">{user.points}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>
    </div>
  );
}
