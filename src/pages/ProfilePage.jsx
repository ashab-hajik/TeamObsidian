import { motion } from "framer-motion";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { useApp } from "../context/AppContext";

export default function ProfilePage() {
  const { currentUser, resources, reviews, leaderboard, currentUserBadges, currentUserActivity, adminStats } = useApp();

  const myResources = useMemo(
    () => resources.filter((resource) => resource.ownerId === currentUser?.id),
    [resources, currentUser]
  );

  const myReviews = useMemo(
    () => reviews.filter((review) => review.userId === currentUser?.id),
    [reviews, currentUser]
  );

  const rank = leaderboard.findIndex((entry) => entry.id === currentUser?.id) + 1;
  const score = leaderboard.find((entry) => entry.id === currentUser?.id)?.points ?? 0;

  if (!currentUser) {
    return <EmptyState title="No active user" subtitle="Please login to view profile details." />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:col-span-2"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">Profile</p>
        <div className="mt-1 flex items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              currentUser.role === "ADMIN"
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            {currentUser.role}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Info label="College" value={currentUser.college} />
          <Info label="Branch" value={currentUser.branch} />
          <Info label="Semester" value={currentUser.semester} />
          <Info label="Leaderboard Rank" value={`#${rank}`} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Total Points" value={score} accent="indigo" />
          <Metric label="Uploads" value={myResources.length} accent="emerald" />
          <Metric label="Reviews Given" value={myReviews.length} accent="amber" />
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Earned Badges</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {currentUserBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="space-y-5">
        {currentUser.role === "ADMIN" ? (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-soft dark:border-indigo-800 dark:bg-indigo-950/40">
            <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Admin Overview</h3>
            <p className="mt-2 text-sm text-indigo-700/90 dark:text-indigo-200/80">
              System has {adminStats.totalUsers} users, {adminStats.totalResources} resources, and {adminStats.totalReviews} reviews.
            </p>
            <Link
              to="/admin"
              className="mt-3 inline-block rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Uploads</h3>
          <div className="mt-3 space-y-2">
            {myResources.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No uploads yet.</p>
            ) : (
              myResources.slice(0, 6).map((resource) => (
                <div key={resource.id} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{resource.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{resource.subject} | {resource.type}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
          <div className="mt-3 space-y-2">
            {currentUserActivity.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</p>
            ) : (
              currentUserActivity.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <p className="font-medium text-slate-800 dark:text-slate-200">{item.text}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}

function Metric({ label, value, accent }) {
  const classes = {
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  };

  return (
    <div className={`rounded-xl border p-3 ${classes[accent]}`}>
      <p className="text-xs uppercase tracking-[0.12em]">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
