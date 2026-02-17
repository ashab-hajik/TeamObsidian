import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role ?? "USER")) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
