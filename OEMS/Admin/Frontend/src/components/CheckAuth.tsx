import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { RootState } from "../store/store";

interface CheckAuthProps {
  children: ReactNode;
}

function CheckAuth({ children }: CheckAuthProps) {
    const user = useSelector((state: RootState) => state.user);
    const location = useLocation();
    const isAuthenticated = !!user.name;
  
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
