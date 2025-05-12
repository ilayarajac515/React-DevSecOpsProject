import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/GlobalContext";
import CircularProgressBar from "./CircularProgressBar";

interface CheckAuthProps {
  children: ReactNode;
}

function CheckAuth({ children }: CheckAuthProps) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const isAuthenticated = !!isAdmin;
  const path = location.pathname;

  const [delayedLoading, setDelayedLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 500);
    return () => clearTimeout(timer);
  }, [loading]);

  const isPublicRoute =
    path === "/" ||
    path === "/sign-up" ||
    path === "/forget-password" ||
    path.startsWith("/reset-password") || 
    path.startsWith("/candidate-registration-page/");

  if (loading || delayedLoading) {
    return <CircularProgressBar />;
  }

  if (isAuthenticated && isPublicRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;
