export default function SearchFilterBar({
  search,
  setSearch,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  subjects,
  compact = false,
}) {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div
      className={`grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 ${
        compact ? "lg:grid-cols-2" : "lg:grid-cols-6"
      }`}
    >
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search title, subject, tags"
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-indigo-300 transition focus:ring dark:border-slate-700 dark:bg-slate-800"
      />

      {!compact && (
        <>
      <select
        value={filters.subject}
        onChange={(e) => update("subject", e.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="All">All Subjects</option>
        {subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>

      <select
        value={filters.semester}
        onChange={(e) => update("semester", e.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="All">All Semesters</option>
        {["1", "2", "3", "4", "5", "6", "7", "8"].map((semester) => (
          <option key={semester} value={semester}>
            Sem {semester}
          </option>
        ))}
      </select>

      <select
        value={filters.type}
        onChange={(e) => update("type", e.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="All">All Types</option>
        {[
          { value: "Notes", label: "Notes" },
          { value: "PYQ", label: "PYQ" },
          { value: "Assignment", label: "Assignment" },
          { value: "Project", label: "Project" },
        ].map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      <select
        value={filters.privacy}
        onChange={(e) => update("privacy", e.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="All">All Privacy</option>
        <option value="Public">Public</option>
        <option value="Private">Private</option>
      </select>
        </>
      )}

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="latest">Latest</option>
        <option value="highest">Highest Rated</option>
      </select>
    </div>
  );
}
