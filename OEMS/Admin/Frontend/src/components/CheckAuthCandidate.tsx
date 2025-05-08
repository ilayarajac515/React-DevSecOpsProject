import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCandidate } from "../context/CandidateContext";


interface CheckAuthProps {
  children: ReactNode;
}

function CheckAuthCandidate({ children }: CheckAuthProps) {
  const { email, authorized } = useCandidate();
  const location = useLocation();
  const path = location.pathname;
  const [delayedLoading, setDelayedLoading] = useState(true);

  const isAuthenticated = !!email && authorized;
  const isLoginRoute = path === "/candidate-login" || path.startsWith("/candidate-login/");
  const isAssessmentRoute = path.startsWith("/assessment-page/");

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);


  // Not authenticated but accessing assessment
  if (!isAuthenticated && isAssessmentRoute) {
    const formId = path.split("/assessment-page/")[1];
    return <Navigate to={`/candidate-login/${formId}`} replace />;
  }

  // Authenticated but trying to access login again
  if (isAuthenticated && isLoginRoute) {
    const formId = path.split("/candidate-login/")[1];
    return <Navigate to={`/assessment-page/${formId || ""}`} replace />;
  }

  return <>{children}</>;
}

export default CheckAuthCandidate;
