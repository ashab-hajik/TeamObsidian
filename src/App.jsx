import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastContainer from "./components/ToastContainer";
import { useApp } from "./context/AppContext";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MyResourcesPage from "./pages/MyResourcesPage";
import ProfilePage from "./pages/ProfilePage";
import ResourceDetailsPage from "./pages/ResourceDetailsPage";
import UploadPage from "./pages/UploadPage";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const { currentUser } = useApp();
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/auth"
            element={
              currentUser ? (
                <Navigate to="/home" replace />
              ) : (
                <AnimatedPage>
                  <AuthPage />
                </AnimatedPage>
              )
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/home"
              element={
                <AnimatedPage>
                  <HomePage />
                </AnimatedPage>
              }
            />
            <Route
              path="/upload"
              element={
                <AnimatedPage>
                  <UploadPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/resource/:resourceId"
              element={
                <AnimatedPage>
                  <ResourceDetailsPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/profile"
              element={
                <AnimatedPage>
                  <ProfilePage />
                </AnimatedPage>
              }
            />
            <Route
              path="/about"
              element={
                <AnimatedPage>
                  <AboutPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/my-resources"
              element={
                <AnimatedPage>
                  <MyResourcesPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <AnimatedPage>
                  <LeaderboardPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/access-denied"
              element={
                <AnimatedPage>
                  <AccessDeniedPage />
                </AnimatedPage>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AnimatedPage>
                    <AdminDashboardPage />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to={currentUser ? "/home" : "/auth"} replace />} />
        </Routes>
      </AnimatePresence>

      <ToastContainer />
    </>
  );
}
