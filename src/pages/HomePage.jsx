import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import EmptyState from "../components/EmptyState";
import ResourceCard from "../components/ResourceCard";
import SearchFilterBar from "../components/SearchFilterBar";
import { useApp } from "../context/AppContext";
import { downloadResourcePdf } from "../utils/downloadResourcePdf";

const quotes = [
  "Shared knowledge builds stronger futures.",
  "Learn once, help many.",
  "Your notes today can shape someone's tomorrow.",
  "Education grows when students collaborate.",
];

const heroImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
];

const heroFallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%233b82f6'/%3E%3Cstop offset='50%25' stop-color='%234f46e5'/%3E%3Cstop offset='100%25' stop-color='%2314b8a6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='48%25' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='42' font-weight='700'%3ECampus Learning Hub%3C/text%3E%3Ctext x='50%25' y='56%25' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='22'%3EInclusive • Professional • Educational%3C/text%3E%3C/svg%3E";

const mainBackgroundImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2200&q=80";

export default function HomePage() {
  const {
    resources,
    usersById,
    canAccessResource,
    currentUser,
    examMode,
    pushToast,
    trackRecentlyViewed,
    trackResourceDownload,
    recentlyViewedResources,
    currentUserProgress,
  } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [plannerForm, setPlannerForm] = useState({
    subject: "Data Structures",
    examDate: "",
  });
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerPlan, setPlannerPlan] = useState(null);
  const [downloadingId, setDownloadingId] = useState("");
  const [filters, setFilters] = useState({
    subject: "All",
    semester: "All",
    type: "All",
    privacy: "All",
  });

  const subjects = useMemo(() => {
    return [...new Set(resources.map((resource) => resource.subject))].sort();
  }, [resources]);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...resources]
      .filter((resource) => {
        const examModeHit = !examMode || (resource.isTopRated && resource.isExamOriented);
        const searchHit =
          !query ||
          resource.title.toLowerCase().includes(query) ||
          resource.subject.toLowerCase().includes(query) ||
          resource.tags.join(" ").toLowerCase().includes(query);

        const subjectHit = filters.subject === "All" || resource.subject === filters.subject;
        const semesterHit = filters.semester === "All" || resource.semester === filters.semester;
        const typeHit = filters.type === "All" || resource.type === filters.type;
        const privacyHit = filters.privacy === "All" || resource.privacy === filters.privacy;

        return examModeHit && searchHit && subjectHit && semesterHit && typeHit && privacyHit;
      })
      .sort((a, b) => {
        if (sortBy === "highest") return b.averageRating - a.averageRating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [resources, search, filters, sortBy, examMode]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  const groupedResources = useMemo(() => {
    return filteredResources.reduce((acc, resource) => {
      if (!acc[resource.subject]) acc[resource.subject] = [];
      acc[resource.subject].push(resource);
      return acc;
    }, {});
  }, [filteredResources]);

  const onViewResource = (resourceId) => {
    trackRecentlyViewed(resourceId);
    navigate(`/resource/${resourceId}`);
  };

  const onDownloadResource = async (resource) => {
    setDownloadingId(resource.id);
    trackResourceDownload(resource.id);
    trackRecentlyViewed(resource.id);

    try {
      await downloadResourcePdf(resource);
      pushToast(`Downloaded PDF: ${resource.title}`, "success");
    } catch {
      pushToast("Could not download PDF file.", "error");
    } finally {
      setDownloadingId("");
    }
  };

  const recommendedResources = useMemo(() => {
    const branchKeywords = String(currentUser?.branch ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);
    const preferredSubject = recentlyViewedResources[0]?.subject;

    return [...resources]
      .map((resource) => {
        const semesterScore = String(resource.semester) === String(currentUser?.semester) ? 3 : 0;
        const branchScore = branchKeywords.some((keyword) => resource.subject.toLowerCase().includes(keyword)) ? 2 : 0;
        const preferenceScore = preferredSubject && resource.subject === preferredSubject ? 2 : 0;
        const accessScore = canAccessResource(resource) ? 1 : 0;

        return {
          ...resource,
          _score: semesterScore + branchScore + preferenceScore + accessScore + resource.averageRating,
        };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);
  }, [resources, currentUser?.branch, currentUser?.semester, recentlyViewedResources, canAccessResource]);

  const progressItems = useMemo(() => {
    const viewed = currentUserProgress?.viewedCount ?? 0;
    const downloaded = currentUserProgress?.downloadedCount ?? 0;
    const rated = currentUserProgress?.ratedCount ?? 0;

    return [
      { key: "viewed", label: "Resources Viewed", value: viewed, color: "bg-indigo-500", icon: "VIEW", target: 20 },
      { key: "downloaded", label: "Resources Downloaded", value: downloaded, color: "bg-teal-500", icon: "DOWN", target: 12 },
      { key: "rated", label: "Resources Rated", value: rated, color: "bg-amber-500", icon: "RATE", target: 8 },
    ];
  }, [currentUserProgress]);

  const academicEvents = useMemo(
    () => [
      { id: "e1", title: "DBMS Mid-Sem Exam", date: "2026-03-12", type: "Exam" },
      { id: "e2", title: "OS Assignment Submission", date: "2026-03-15", type: "Assignment" },
      { id: "e3", title: "CN Quiz", date: "2026-03-18", type: "Exam" },
    ],
    []
  );

  const generatePlan = async () => {
    if (!plannerForm.subject || !plannerForm.examDate) {
      pushToast("Please choose subject and exam date.", "error");
      return;
    }

    const today = new Date();
    const examDate = new Date(plannerForm.examDate);
    const daysRemaining = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (Number.isNaN(daysRemaining) || daysRemaining < 1) {
      pushToast("Choose a valid upcoming exam date.", "error");
      return;
    }

    setPlannerLoading(true);
    setPlannerPlan(null);
    await new Promise((resolve) => setTimeout(resolve, 1050));

    const picks = resources
      .filter((resource) => resource.subject === plannerForm.subject)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 4);

    const topicBank = [
      `${plannerForm.subject} fundamentals`,
      "Core definitions and terminology",
      "Important derivations and conceptual diagrams",
      "PYQ pattern analysis",
      "Problem-solving drills",
      "Common viva/interview questions",
    ];

    const buildDays = () => {
      if (daysRemaining <= 10) {
        return Array.from({ length: daysRemaining }).map((_, index) => {
          const isRevision = index >= daysRemaining - 2;
          return {
            label: `Day ${index + 1}`,
            focus: isRevision ? "Final revision buffer + quick recall tests" : topicBank[index % topicBank.length],
            resources: picks.slice(0, isRevision ? 2 : 1),
          };
        });
      }

      const weeks = Math.max(2, Math.ceil(daysRemaining / 7));
      return Array.from({ length: weeks }).map((_, index) => {
        const isFinalWeek = index === weeks - 1;
        return {
          label: `Week ${index + 1}`,
          focus: isFinalWeek
            ? "Final revision buffer, mock tests, and weak-topic patching"
            : `${topicBank[index % topicBank.length]} + active recall`,
          resources: picks.slice(0, Math.min(3, index + 1)),
        };
      });
    };

    const breakdown = buildDays();

    setPlannerPlan({
      subject: plannerForm.subject,
      examDate: plannerForm.examDate,
      daysRemaining,
      breakdown,
      strategy: [
        "Start with concept-first review before solving.",
        "Include one timed practice block every alternate day.",
        "Keep final 2 days for revision buffer and memory consolidation.",
      ],
    });
    setPlannerLoading(false);
  };

  const analytics = useMemo(() => {
    const bySubject = resources.reduce((acc, resource) => {
      acc[resource.subject] = (acc[resource.subject] ?? 0) + 1;
      return acc;
    }, {});

    const byType = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] ?? 0) + 1;
      return acc;
    }, {});

    const maxSubject = Math.max(1, ...Object.values(bySubject));
    const maxType = Math.max(1, ...Object.values(byType));

    return {
      bySubject,
      byType,
      maxSubject,
      maxType,
    };
  }, [resources]);

  return (
    <div className="relative isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <motion.img
          aria-hidden
          src={mainBackgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-10"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(15,23,42,0.12) 0%, rgba(99,102,241,0.08) 45%, rgba(20,184,166,0.08) 100%)",
          }}
          animate={{ opacity: [0.55, 0.75, 0.55] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-500/15"
          animate={{ x: [0, 28, 0], y: [0, -18, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/15"
          animate={{ x: [0, -26, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-1/4 h-52 w-52 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10"
          animate={{ x: [0, 20, 0], y: [0, -16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(99,102,241,0.12) 0%, transparent 40%, rgba(45,212,191,0.12) 100%)",
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-35 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(45,212,191,0.08) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
          animate={{ x: [0, 10, 0], y: [0, -12, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-soft dark:border-slate-700">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative min-h-[280px]">
            <HeroImage
              src={heroImages[0]}
              fallbackSrc={heroFallbackImage}
              alt="Students studying"
              className="h-full w-full rounded-none object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/75 via-blue-700/65 to-teal-600/60" />
            <div className="absolute inset-0 p-6 text-white sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mb-4"
              >
                <AppLogo light className="drop-shadow-[0_8px_18px_rgba(30,58,138,0.35)]" />
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-blue-100/95">
                  Share Knowledge. Learn Better.
                </p>
              </motion.div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-90">Student Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight">Learn Better with Shared Academic Resources</h2>
              <p className="mt-3 max-w-lg text-sm text-blue-100">
                Discover quality notes, exam-oriented packs, and peer-reviewed material from your campus network.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-900/10 p-2">
            {heroImages.slice(1).map((image, index) => (
              <motion.div
                key={image}
                whileHover={{ y: -2, scale: 1.01 }}
                className="group relative overflow-hidden rounded-2xl shadow-lg shadow-indigo-900/10"
              >
                <HeroImage
                  src={image}
                  fallbackSrc={heroFallbackImage}
                  alt="Campus learning"
                  className="h-[140px] w-full object-cover transition duration-300 group-hover:scale-[1.03] md:h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-indigo-800/20 to-transparent" />
                <p className="absolute bottom-2 left-2 text-[11px] font-medium text-white/90">
                  {index === 0 ? "Inclusive classrooms" : "Focused group study"}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">Learning Progress</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Auto-tracked from your activity</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {progressItems.map((item) => {
              const ratio = Math.min(100, Math.round((item.value / item.target) * 100));
              return (
                <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    {item.icon}
                  </p>
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-2xl font-bold text-slate-900 dark:text-white"
                  >
                    <AnimatedCount value={item.value} />
                  </motion.p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-2 rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">Academic Calendar</h3>
          <div className="mt-3 space-y-2">
            {academicEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{event.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {event.type} | {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-soft dark:border-indigo-900 dark:bg-slate-900"
      >
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Motivation</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={quoteIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-1 text-lg font-medium text-slate-800 dark:text-slate-100"
          >
            {quotes[quoteIndex]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">Browse</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Resources</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredResources.length} of {resources.length} resources for {currentUser?.college}
        </p>
      </div>

      {examMode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
        >
          Exam Mode active: showing Top Rated + Exam Oriented resources only.
        </motion.div>
      )}

      <SearchFilterBar
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        subjects={subjects}
        compact={examMode}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
            Filtered Results
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Filters above control the resource cards below</p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
                className="h-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <EmptyState
            title="No resources matched your filters"
            subtitle="Try a different subject, remove filters, or upload a new resource."
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResources).map(([subject, sectionResources]) => (
              <section key={subject}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{subject}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sectionResources.length} resources</p>
                </div>

                <motion.div layout className="space-y-3">
                  <div className="no-scrollbar flex flex-nowrap gap-4 overflow-x-auto pb-2 pr-1 scroll-smooth touch-pan-x">
                    <AnimatePresence>
                      {sectionResources.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          owner={usersById[resource.ownerId]}
                          canAccess={canAccessResource(resource)}
                          onView={() => onViewResource(resource.id)}
                          onDownload={() => onDownloadResource(resource)}
                          className={`w-[310px] min-w-[310px] max-w-[310px] shrink-0 ${downloadingId === resource.id ? "ring-2 ring-indigo-300" : ""}`}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </section>
            ))}
          </div>
        )}
      </section>

      {!examMode && recommendedResources.length > 0 && (
        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-teal-50 p-4 shadow-soft dark:border-indigo-800 dark:from-indigo-950/30 dark:via-slate-900 dark:to-teal-950/20">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recommended for You</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Matched by semester, your study trends, and top ratings.</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scroll horizontally</p>
          </div>

          <div className="no-scrollbar flex flex-nowrap gap-4 overflow-x-auto pb-2 pr-1 scroll-smooth touch-pan-x">
            {recommendedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                owner={usersById[resource.ownerId]}
                canAccess={canAccessResource(resource)}
                onView={() => onViewResource(resource.id)}
                onDownload={() => onDownloadResource(resource)}
                className={`w-[310px] min-w-[310px] max-w-[310px] shrink-0 ${downloadingId === resource.id ? "ring-2 ring-indigo-300" : ""}`}
              />
            ))}
          </div>
        </section>
      )}

      {!examMode && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Study Planner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI-assisted planner (demo)</p>
            </div>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-300">We help students plan smarter, not just find notes.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <select
              value={plannerForm.subject}
              onChange={(e) => setPlannerForm((prev) => ({ ...prev, subject: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={plannerForm.examDate}
              onChange={(e) => setPlannerForm((prev) => ({ ...prev, examDate: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-800"
            />
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={generatePlan}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Generate Plan
            </motion.button>
          </div>

          {plannerLoading && (
            <div className="mt-4 flex items-center gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                  className="h-2 w-2 rounded-full bg-indigo-500"
                />
              ))}
              <p className="ml-2 text-sm text-slate-500 dark:text-slate-400">Generating your personalized study plan...</p>
            </div>
          )}

          {plannerPlan && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-sm dark:border-indigo-900 dark:bg-indigo-950/30">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {plannerPlan.daysRemaining} days remaining until exam ({new Date(plannerPlan.examDate).toLocaleDateString()})
                </p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {plannerPlan.strategy.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {plannerPlan.breakdown.map((phase) => (
                <motion.div
                  key={phase.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-indigo-600 dark:text-indigo-300">{phase.label}</p>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{phase.focus}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Recommended resources:</p>
                  <ul className="mt-1 space-y-1">
                    {phase.resources.map((resource) => (
                      <li key={`${phase.label}_${resource.id}`} className="text-xs text-slate-700 dark:text-slate-300">
                        - {resource.title}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!examMode && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Resource Analytics</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Snapshot of shared resources by subject and type.</p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Resources per Subject</p>
              <div className="mt-3 space-y-2">
                {Object.entries(analytics.bySubject).map(([label, count]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">{label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((count / analytics.maxSubject) * 100)}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Resources per Type</p>
              <div className="mt-3 space-y-2">
                {Object.entries(analytics.byType).map(([label, count]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">{label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((count / analytics.maxType) * 100)}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {!examMode && recentlyViewedResources.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">Recently Viewed</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyViewedResources.map((resource) => (
              <button
                key={resource.id}
                onClick={() => navigate(`/resource/${resource.id}`)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-indigo-700"
              >
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{resource.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{resource.subject} | Sem {resource.semester}</p>
              </button>
            ))}
          </div>
        </section>
      )}

    </div>
    </div>
  );
}

function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 700;
    const steps = 20;
    const stepTime = Math.floor(duration / steps);
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
        return;
      }
      setDisplay(Math.floor(current));
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

function HeroImage({ src, fallbackSrc, alt, className }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative h-full w-full">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-slate-200/80 dark:bg-slate-700/70" />}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
          setLoaded(true);
        }}
        className={className}
      />
    </div>
  );
}
