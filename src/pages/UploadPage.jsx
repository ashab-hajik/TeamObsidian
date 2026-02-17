import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resourceTypes } from "../data/mockData";
import { useApp } from "../context/AppContext";

const initialForm = {
  title: "",
  subject: "",
  semester: "1",
  type: "Notes",
  tags: "",
  privacy: "Public",
  description: "",
};

export default function UploadPage() {
  const navigate = useNavigate();
  const { uploadResource, pushToast } = useApp();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [successId, setSuccessId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const validateFile = (file) => {
    if (!file) return "Please upload a file (PDF/PNG/JPG).";
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) return "Unsupported file type. Allowed: PDF, PNG, JPG.";
    if (file.size > 5 * 1024 * 1024) return "File exceeds 5MB mock size limit.";
    return "";
  };

  const onFilePick = (file) => {
    const fileError = validateFile(file);
    if (fileError) {
      setSelectedFile(null);
      setErrors((prev) => [...prev.filter((item) => !item.includes("file")), fileError]);
      pushToast("Upload failed: invalid file.", "error");
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => prev.filter((item) => !item.includes("file") && !item.includes("Unsupported")));
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    onFilePick(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = [];
    if (!form.title.trim()) validationErrors.push("Title is required.");
    if (!form.subject.trim()) validationErrors.push("Subject is required.");
    if (!form.tags.trim()) validationErrors.push("Tags are required.");
    const fileError = validateFile(selectedFile);
    if (fileError) validationErrors.push(fileError);

    setErrors(validationErrors);
    if (validationErrors.length) {
      pushToast("Upload validation failed.", "error");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const fileMeta = {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
    };

    const resource = uploadResource({ ...form, tags, fileMeta });
    if (!resource) {
      setErrors(["Could not upload resource. Please login again."]);
      pushToast("Upload failed.", "error");
      setIsSubmitting(false);
      return;
    }

    setSuccessId(resource.id);
    setShowSuccessModal(true);
    setForm(initialForm);
    setSelectedFile(null);
    pushToast("Resource uploaded successfully.", "success");
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">Contribute</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload a Resource</h2>
      </div>

      <form
        onSubmit={submit}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Title</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-indigo-300 transition focus:ring dark:border-slate-700 dark:bg-slate-800"
            placeholder="Eg. Operating Systems Revision Notes"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Subject</label>
          <input
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-indigo-300 transition focus:ring dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Semester</label>
          <select
            value={form.semester}
            onChange={(e) => update("semester", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
          >
            {["1", "2", "3", "4", "5", "6", "7", "8"].map((semester) => (
              <option key={semester} value={semester}>
                Semester {semester}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Resource Type</label>
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
          >
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Privacy</label>
          <select
            value={form.privacy}
            onChange={(e) => update("privacy", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-indigo-300 transition focus:ring dark:border-slate-700 dark:bg-slate-800"
            placeholder="exam, unit-1, quick-revision"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-indigo-300 transition focus:ring dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">File Upload</label>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-sm transition ${
              dragging
                ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40"
            }`}
          >
            <p className="font-medium text-slate-700 dark:text-slate-200">Drag and drop PDF/JPG/PNG here</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">or click to browse (max 5MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              className="hidden"
              onChange={(event) => onFilePick(event.target.files?.[0])}
            />
          </div>
        </div>

        {selectedFile && (
          <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Preview</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{selectedFile.name}</p>
            {selectedFile.type.startsWith("image/") && previewUrl ? (
              <img src={previewUrl} alt="Upload preview" className="mt-2 h-24 rounded-lg object-cover" />
            ) : (
              <div className="mt-2 inline-block rounded-lg bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                PDF File Selected
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="sm:col-span-2 rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700"
            >
              <ul className="list-disc pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sm:col-span-2 flex justify-end">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21V9" />
                <path d="m7 14 5-5 5 5" />
                <rect x="3" y="3" width="18" height="4" rx="1" />
              </svg>
              {isSubmitting ? "Uploading..." : "Upload Resource"}
            </span>
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {showSuccessModal && successId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 shadow-soft dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              <h3 className="text-lg font-semibold">Upload successful!</h3>
              <p className="mt-1 text-sm">Your resource has been added and +10 points were credited.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-emerald-100 dark:border-emerald-700 dark:hover:bg-emerald-900/30"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate(`/resource/${successId}`);
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500"
                >
                  View Resource
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
