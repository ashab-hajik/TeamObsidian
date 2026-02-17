import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

export default function AdminDashboardPage() {
  const {
    adminStats,
    resources,
    users,
    usersById,
    toggleFeaturedResource,
    deleteResource,
    pushToast,
  } = useApp();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-700 to-blue-600 p-5 text-white shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]">Admin Control Center</p>
        <h2 className="mt-1 text-2xl font-bold">Resource Moderation Dashboard</h2>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total Users" value={adminStats.totalUsers} />
        <StatCard label="Total Resources" value={adminStats.totalResources} />
        <StatCard label="Total Reviews" value={adminStats.totalReviews} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Resource Moderation</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="py-2">Title</th>
                <th className="py-2">Owner</th>
                <th className="py-2">Type</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <motion.tr
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                  className="border-b border-slate-100 transition-colors dark:border-slate-800"
                >
                  <td className="py-2">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{resource.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{resource.subject} | Sem {resource.semester}</p>
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-300">
                    <p>{usersById[resource.ownerId]?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{resource.college}</p>
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-300">{resource.type}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          resource.featured
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {resource.featured ? "Featured" : "Standard"}
                      </span>
                      {resource.privacy === "Private" && (
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                          Private
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          toggleFeaturedResource(resource.id);
                          pushToast("Resource feature flag updated.", "info");
                        }}
                        className="rounded-lg border border-indigo-200 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
                      >
                        Toggle Feature
                      </button>
                      <button
                        onClick={() => {
                          deleteResource(resource.id);
                          pushToast("Resource deleted by admin.", "success");
                        }}
                        className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Management</h3>
        <div className="mt-3 space-y-2">
          {users.map((user) => (
            <motion.div
              key={user.id}
              whileHover={{ y: -1 }}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.college} | {user.branch} | Sem {user.semester}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  user.role === "ADMIN"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}
              >
                {user.role}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </motion.div>
  );
}
