import { motion } from "framer-motion";

export default function RatingStars({ value = 0, onChange, size = 22 }) {
  const interactive = typeof onChange === "function";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <motion.button
            key={star}
            type="button"
            whileTap={interactive ? { scale: 0.88 } : undefined}
            whileHover={interactive ? { scale: 1.08 } : undefined}
            onClick={() => interactive && onChange(star)}
            disabled={!interactive}
            className={`leading-none transition ${interactive ? "cursor-pointer" : "cursor-default"}`}
            style={{ fontSize: size }}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              className={active ? "fill-amber-400" : "fill-slate-300 dark:fill-slate-600"}
              aria-hidden="true"
            >
              <path d="M12 2.5l2.93 5.94 6.57.95-4.75 4.63 1.12 6.55L12 17.5l-5.87 3.07 1.12-6.55L2.5 9.39l6.57-.95L12 2.5z" />
            </svg>
          </motion.button>
        );
      })}
    </div>
  );
}
