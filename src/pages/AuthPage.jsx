import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const initialRegister = {
  name: "",
  email: "",
  college: "",
  branch: "",
  semester: "1",
  password: "",
  role: "USER",
};

const quotes = [
  "Knowledge grows when shared.",
  "Learn better, together.",
  "Your notes can help someone succeed.",
  "Education is a collaborative journey.",
  "Built by students, for students.",
];

const platformStats = [
  { label: "Used by colleges", value: 120, suffix: "+", icon: "COL" },
  { label: "Trusted students", value: 25000, suffix: "+", icon: "STD" },
  { label: "Academic resources shared", value: 10000, suffix: "+", icon: "RES" },
];

const socialProviders = [
  {
    name: "Google",
    icon: "G",
    loginUrl: "https://accounts.google.com",
    classes:
      "border-rose-200 bg-rose-50/70 text-rose-700 hover:border-rose-300 hover:shadow-rose-200/60 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200",
  },
  {
    name: "GitHub",
    icon: "GH",
    loginUrl: "https://github.com/login",
    classes:
      "border-slate-300 bg-slate-100/80 text-slate-800 hover:border-slate-400 hover:shadow-slate-300/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  },
  {
    name: "LinkedIn",
    icon: "IN",
    loginUrl: "https://www.linkedin.com/login",
    classes:
      "border-blue-200 bg-blue-50/70 text-blue-700 hover:border-blue-300 hover:shadow-blue-200/60 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
  },
  {
    name: "Microsoft",
    icon: "MS",
    loginUrl: "https://login.microsoftonline.com",
    classes:
      "border-teal-200 bg-teal-50/70 text-teal-700 hover:border-teal-300 hover:shadow-teal-200/60 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200",
  },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginUser, registerUser, pushToast } = useApp();
  const [mode, setMode] = useState("login");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState(initialRegister);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [focusedField, setFocusedField] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  const passwordStrength = useMemo(() => {
    const value = mode === "login" ? loginData.password : registerData.password;
    let score = 0;
    if (value.length >= 6) score += 1;
    if (/[A-Z]/.test(value) || /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
  }, [mode, loginData.password, registerData.password]);

  const validate = (data, type) => {
    const errors = {};
    if (!data.email?.trim()) errors.email = "Email is required.";
    if (data.email && !emailRegex.test(data.email)) errors.email = "Enter a valid academic email.";
    if (!data.password?.trim()) errors.password = "Password is required.";
    if (data.password && data.password.length < 6) errors.password = "Password must be at least 6 characters.";

    if (type === "register") {
      if (!data.name?.trim()) errors.name = "Name is required.";
      if (!data.college?.trim()) errors.college = "College is required.";
      if (!data.branch?.trim()) errors.branch = "Branch is required.";
    }

    return errors;
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validate(loginData, "login");
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Please fix validation issues before continuing.");
      pushToast("Login failed. Check required fields.", "error");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 650));

    const user = loginUser(loginData);
    if (!user) {
      setError("No matching user found. Try Register or use seeded demo users.");
      pushToast("Login failed. Invalid credentials.", "error");
      setIsSubmitting(false);
      return;
    }

    setSuccessPulse(true);
    pushToast(`Welcome back, ${user.name}.`, "success");
    setTimeout(() => {
      navigate("/home");
      setIsSubmitting(false);
      setSuccessPulse(false);
    }, 450);
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validate(registerData, "register");
    setFieldErrors(errors);

    if (Object.keys(errors).length) {
      setError("Please fill all required fields correctly.");
      pushToast("Registration failed. Fix input validation.", "error");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    registerUser(registerData);
    setSuccessPulse(true);
    pushToast("Account created successfully.", "success");
    setTimeout(() => {
      navigate("/home");
      setIsSubmitting(false);
      setSuccessPulse(false);
    }, 500);
  };

  const onSocialLogin = (provider) => {
    window.open(provider.loginUrl, "_blank", "noopener,noreferrer");
    pushToast(`Opening ${provider.name} login page (Demo redirect).`, "info");
  };

  const inputClasses = (key) =>
    `w-full rounded-xl border bg-white/70 px-3 py-2 text-sm outline-none transition dark:bg-slate-900/70 ${
      fieldErrors[key]
        ? "border-rose-300 ring-rose-200"
        : focusedField === key
          ? "border-indigo-300 ring-2 ring-indigo-200/60 dark:ring-indigo-900/60"
          : "border-slate-200 dark:border-slate-700"
    }`;

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-100 via-blue-100/70 to-teal-100/60 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(125deg, rgba(99,102,241,0.12) 0%, rgba(56,189,248,0.08) 45%, rgba(45,212,191,0.12) 100%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(45,212,191,0.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
        animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-indigo-400/25 blur-3xl"
        animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-10 right-10 h-52 w-52 rounded-full bg-teal-400/25 blur-3xl"
        animate={{ x: [0, -16, 0], y: [0, 12, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-1/3 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl"
        animate={{ x: [0, 14, 0], y: [0, 16, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center py-8">
        <div className="w-full space-y-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative grid w-full overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-soft backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/60 md:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-800 p-8 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(45,212,191,0.18),transparent_35%)]" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.18em] opacity-90">Educational Futuristic Interface</p>
          <h1 className="relative mt-3 text-3xl font-semibold leading-tight">Campus Academic Resource Sharing Platform</h1>
          <p className="relative mt-3 max-w-md text-sm text-indigo-100">
            Trusted academic collaboration, designed for focused learning and faster study outcomes.
          </p>

          <div className="relative mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm backdrop-blur-md">
            <p className="font-semibold">Quick Demo Login</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-indigo-100">
              <li>aarav.mehta@campus.demo + pass1234 (USER)</li>
              <li>riya.sharma@campus.demo + admin1234 (ADMIN)</li>
            </ul>
          </div>

          <div className="relative mt-8 rounded-2xl border border-white/20 bg-slate-900/25 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-200">Academic Quote</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="mt-2 text-lg font-medium text-white"
              >
                {quotes[quoteIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setMode("login")}
              className={`w-1/2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-indigo-700 shadow dark:bg-slate-700 dark:text-indigo-200"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`w-1/2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-white text-indigo-700 shadow dark:bg-slate-700 dark:text-indigo-200"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </motion.p>
          )}

          <div className="mb-5 grid grid-cols-2 gap-2">
            {socialProviders.map((provider) => (
              <motion.button
                key={provider.name}
                type="button"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSocialLogin(provider)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition hover:shadow ${provider.classes}`}
              >
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px] dark:bg-slate-800">
                  {provider.icon}
                </span>
                {provider.name}
              </motion.button>
            ))}
          </div>

          <p className="mb-4 text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">or continue with email</p>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={submitLogin}
                className="space-y-4"
              >
                <div>
                  <input
                    type="email"
                    className={inputClasses("email")}
                    placeholder="Academic email"
                    value={loginData.email}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
                </div>
                <div>
                  <input
                    type="password"
                    className={inputClasses("password")}
                    placeholder="Password"
                    value={loginData.password}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField("")}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  />
                  {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
                </div>

                <PasswordStrength score={passwordStrength} />

                <button
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Signing in..." : "Continue to Dashboard"}
                  {successPulse && <SuccessCheck />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={submitRegister}
                className="grid gap-3"
              >
                <div>
                  <input
                    className={inputClasses("name")}
                    placeholder="Full name"
                    value={registerData.name}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField("")}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  {fieldErrors.name && <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>}
                </div>

                <div>
                  <input
                    type="email"
                    className={inputClasses("email")}
                    placeholder="Academic email"
                    value={registerData.email}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <input
                      className={inputClasses("college")}
                      placeholder="College"
                      value={registerData.college}
                      onFocus={() => setFocusedField("college")}
                      onBlur={() => setFocusedField("")}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, college: e.target.value }))}
                    />
                    {fieldErrors.college && <p className="mt-1 text-xs text-rose-600">{fieldErrors.college}</p>}
                  </div>

                  <div>
                    <input
                      className={inputClasses("branch")}
                      placeholder="Department / Branch"
                      value={registerData.branch}
                      onFocus={() => setFocusedField("branch")}
                      onBlur={() => setFocusedField("")}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, branch: e.target.value }))}
                    />
                    {fieldErrors.branch && <p className="mt-1 text-xs text-rose-600">{fieldErrors.branch}</p>}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-900/70"
                    value={registerData.semester}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, semester: e.target.value }))}
                  >
                    {["1", "2", "3", "4", "5", "6", "7", "8"].map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>

                  <select
                    className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none transition dark:border-slate-700 dark:bg-slate-900/70"
                    value={registerData.role}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <input
                    type="password"
                    className={inputClasses("password")}
                    placeholder="Password (min 6 chars)"
                    value={registerData.password}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField("")}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                  />
                  {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
                </div>

                <PasswordStrength score={passwordStrength} />

                <button
                  disabled={isSubmitting}
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                  {successPulse && <SuccessCheck />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <section className="grid gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-soft backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 md:grid-cols-3">
        {platformStats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
              {stat.icon}
            </span>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              <CountUp target={stat.value} />
              {stat.suffix}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </section>
        </div>
      </div>
    </div>
  );
}

function CountUp({ target }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const stepTime = 25;
    const steps = Math.max(1, Math.floor(duration / stepTime));
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
        return;
      }
      setValue(Math.floor(current));
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <>{value.toLocaleString()}</>;
}

function PasswordStrength({ score }) {
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Excellent"];
  const safeScore = Math.max(0, Math.min(score, 4));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <p className="text-slate-500 dark:text-slate-400">Password strength</p>
        <p className="font-medium text-slate-600 dark:text-slate-300">{labels[safeScore]}</p>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full ${idx < safeScore ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"}`}
          />
        ))}
      </div>
    </div>
  );
}

function SuccessCheck() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs"
    >
      OK
    </motion.span>
  );
}
