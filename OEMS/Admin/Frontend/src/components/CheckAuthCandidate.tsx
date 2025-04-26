import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface CheckAuthProps {
  children: ReactNode;
}

function CheckAuthCandidate({ children }: CheckAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  useEffect(() => {
    const token = localStorage.getItem("candidateToken");
    setIsAuthenticated(!!token);
  }, []);

  console.log(isAuthenticated);
  if (isAuthenticated === null) {
    
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/candidate-login" replace />;
  }
  if(isAuthenticated  && location.pathname === "/candidate-login" ){
    return <Navigate to="/assessment-page" replace />
  }

  return <>{children}</>;
}

export default CheckAuthCandidate;
