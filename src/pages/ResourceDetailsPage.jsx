import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import RatingStars from "../components/RatingStars";
import { useApp } from "../context/AppContext";
import { downloadResourcePdf, getMockPdfMeta } from "../utils/downloadResourcePdf";

const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString();

const buildAssistantSummary = (resource) => {
  const primaryTags = resource.tags.slice(0, 3).join(", ");
  return {
    overview: `This ${resource.type.toLowerCase()} resource for Semester ${resource.semester} in ${resource.subject} is designed to support focused revision and concept clarity.`,
    concepts: [
      `Core topics: ${primaryTags || "fundamental principles"}`,
      `Resource type strategy: how to use ${resource.type} for active recall`,
      `Bridge to exam context with past-pattern alignment`,
    ],
    tips: [
      "Review once for structure, then solve/annotate without looking at the source.",
      "Convert each section into 2-3 short recall prompts before exam week.",
      "Prioritize repeated keywords and mark weak areas for quick final revision.",
    ],
    important: [
      `Practice at least one timed run for ${resource.subject}.`,
      "Keep a one-page summary sheet for last-day revision.",
      "Discuss difficult points with peers for faster retention.",
    ],
  };
};

export default function ResourceDetailsPage() {
  const { resourceId } = useParams();
  const {
    resources,
    usersById,
    reviewsByResource,
    currentUser,
    canAccessResource,
    submitReview,
    reviews,
    pushToast,
    trackRecentlyViewed,
    trackResourceDownload,
  } = useApp();

  const resource = resources.find((item) => item.id === resourceId);
  const owner = resource ? usersById[resource.ownerId] : null;
  const canAccess = resource ? canAccessResource(resource) : false;

  const reviewList = reviewsByResource[resourceId] ?? [];

  const existingReview = useMemo(() => {
    if (!currentUser) return null;
    return reviews.find(
      (review) => review.resourceId === resourceId && review.userId === currentUser.id
    );
  }, [reviews, resourceId, currentUser]);

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [saved, setSaved] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantStage, setAssistantStage] = useState(0);

  const aiSummary = useMemo(() => (resource ? buildAssistantSummary(resource) : null), [resource]);

  useEffect(() => {
    if (resource?.id) {
      trackRecentlyViewed(resource.id);
    }
  }, [resource?.id, trackRecentlyViewed]);

  useEffect(() => {
    if (!assistantOpen) {
      setAssistantLoading(false);
      setAssistantStage(0);
      return;
    }

    setAssistantLoading(true);
    const typingTimer = setTimeout(() => {
      setAssistantLoading(false);
      setAssistantStage(1);
    }, 700);

    const revealTwo = setTimeout(() => setAssistantStage(2), 1100);
    const revealThree = setTimeout(() => setAssistantStage(3), 1500);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(revealTwo);
      clearTimeout(revealThree);
    };
  }, [assistantOpen]);

  const onSubmitReview = (e) => {
    e.preventDefault();
    if (!rating) return;
    submitReview({ resourceId, rating, comment });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const fileMeta = getMockPdfMeta(resource);

  const onDownload = async () => {
    if (!resource) return;
    setDownloadLoading(true);
    trackResourceDownload(resource.id);

    try {
      await downloadResourcePdf(resource);
      pushToast(`Downloaded PDF: ${resource.title}`, "success");
    } catch {
      pushToast("Could not download PDF file.", "error");
    } finally {
      setDownloadLoading(false);
    }
  };

  if (!resource) {
    return (
      <EmptyState
        title="Resource not found"
        subtitle="The requested resource does not exist or was removed."
      />
    );
  }

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-800 dark:bg-rose-950/30"
        >
          <h2 className="text-2xl font-bold text-rose-700 dark:text-rose-200">Access Denied</h2>
          <p className="mt-2 text-sm text-rose-700/80 dark:text-rose-200/80">
            This resource is private and available only to students from {resource.college}.
          </p>
          <button
            type="button"
            disabled
            title="Private resource: only your college can download"
            className="mt-4 cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v11" />
                <path d="m7 10 5 5 5-5" />
                <path d="M4 20h16" />
              </svg>
              Download Resource
            </span>
          </button>
          <Link
            to="/home"
            className="mt-3 inline-block rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Back to Browse
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">Resource Detail</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{resource.title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {resource.subject} | Semester {resource.semester} | {resource.type}
        </p>

        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {resource.description || "No description provided."}
        </p>

        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
        >
          <span className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 9h8" />
              <path d="M8 13h5" />
            </svg>
            Summarise for Study
          </span>
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onDownload}
          disabled={downloadLoading}
          className="ml-2 mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v11" />
              <path d="m7 10 5 5 5-5" />
              <path d="M4 20h16" />
            </svg>
            {downloadLoading ? "Preparing PDF..." : "Download Resource"}
          </span>
        </motion.button>

        <div className="mt-4 flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
          <p>File Type: {fileMeta.fileType}</p>
          <p>File Size: {fileMeta.fileSize}</p>
          <p>Uploaded by: {owner?.name ?? "Unknown"}</p>
          <p>College: {resource.college}</p>
          <p>Subject: {resource.subject}</p>
          <p>Semester: {resource.semester}</p>
          <p>Description: {resource.description || "No description provided."}</p>
          <p>Uploaded: {formatDate(resource.createdAt)}</p>
        </div>
      </section>

      <aside className="space-y-5">
        <motion.form
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={onSubmitReview}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rate this resource</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Only one review per user. You can update anytime.</p>

          <div className="mt-3">
            <RatingStars value={rating} onChange={setRating} size={28} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Write a short review"
            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-indigo-300 transition focus:ring dark:border-slate-700 dark:bg-slate-800"
          />

          <button
            type="submit"
            className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            {existingReview ? "Update Review" : "Submit Review"}
          </button>

          {saved && <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">Saved successfully.</p>}
        </motion.form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reviews ({reviewList.length})</h3>
          <div className="mt-3 space-y-3">
            {reviewList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet.</p>
            ) : (
              reviewList
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((review) => (
                  <div key={review.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {usersById[review.userId]?.name ?? "Student"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <RatingStars value={review.rating} size={16} />
                      <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                    </div>
                    {review.comment && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>}
                  </div>
                ))
            )}
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {assistantOpen && aiSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4"
          >
            <motion.section
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">AI Study Assistant</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">AI-assisted summary (demo)</h3>
                </div>
                <button
                  onClick={() => setAssistantOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    AI
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Academic Assistant</p>
                </div>

                {assistantLoading ? (
                  <div className="flex items-center gap-1 px-1 py-3">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                        className="h-2 w-2 rounded-full bg-indigo-500"
                      />
                    ))}
                    <p className="ml-2 text-sm text-slate-500 dark:text-slate-400">Preparing study-focused summary...</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                    {assistantStage >= 1 && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="font-semibold text-slate-900 dark:text-white">Overview</p>
                        <p className="mt-1 leading-6">{aiSummary.overview}</p>
                      </motion.div>
                    )}

                    {assistantStage >= 2 && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3 md:grid-cols-2">
                        <InfoList title="Key Concepts" items={aiSummary.concepts} />
                        <InfoList title="Exam-focused Tips" items={aiSummary.tips} />
                      </motion.div>
                    )}

                    {assistantStage >= 3 && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                        <InfoList title="Important Points to Remember" items={aiSummary.important} />
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoList({ title, items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/70">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-300">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
