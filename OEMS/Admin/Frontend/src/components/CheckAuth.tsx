import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/GlobalContext";

interface CheckAuthProps {
  children: ReactNode;
}

function CheckAuth({ children }: CheckAuthProps) {
  const { authorized, loading } = useAuth();
  const location = useLocation();

  const publicRoutes = ["/sign-in", "/sign-up"];
  const privateRoutes = ["/", "/field-listing-page"];
  
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const isPrivateRoute = privateRoutes.includes(location.pathname);

  if (loading) {
    return null; // or a loading spinner
  }

  const isAuthenticated = !!authorized;

  if (!isAuthenticated && isPrivateRoute) {
    return <Navigate to="/sign-in" replace />;
  }

  if (isAuthenticated && isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;
