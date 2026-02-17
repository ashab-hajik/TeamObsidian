/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15, 23, 42, 0.35)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 40%), radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.16), transparent 45%)",
      },
    },
  },
  plugins: [],
};
