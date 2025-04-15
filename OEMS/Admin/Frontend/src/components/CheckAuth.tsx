import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../GlobalContext/GlobalContext";

interface CheckAuthProps {
  children: ReactNode;
}

function CheckAuth({ children }: CheckAuthProps) {
    const { authorized } = useAuth();
    const location = useLocation();
    const isAuthenticated = !!authorized;
  
    const publicRoutes = ["/sign-in", "/sign-up"];
    const isPublicRoute = publicRoutes.includes(location.pathname);
  
    if (!isAuthenticated && location.pathname === "/") {
      return <Navigate to="/sign-in" replace />;
    }
  
    if (isAuthenticated && isPublicRoute) {
      return <Navigate to="/" replace />;
    }
  
    return <>{children}</>;
  }
  
export default CheckAuth;
