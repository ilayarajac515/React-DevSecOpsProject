import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useEffect,
  } from "react";
  import { useCheckCandidateAuthQuery } from "../modules/candidate_slice";
  
  interface CandidateState {
    email: string | null;
    authorized: boolean | null;
    setAuth: (auth: { email: string | null; authorized: boolean | null }) => void;
  }
  
  const defaultCandidateState: CandidateState = {
    email: null,
    authorized: null,
    setAuth: () => {},
  };
  
  const CandidateContext = createContext<CandidateState>(defaultCandidateState);
  
  interface CandidateProviderProps {
    children: ReactNode;
  }
  
  export const CandidateProvider: React.FC<CandidateProviderProps> = ({ children }) => {
    const { data } = useCheckCandidateAuthQuery();
    const [auth, setAuthState] = useState<Omit<CandidateState, "setAuth">>({
        email: null,
        authorized: null,
      });
      
    const setAuth = useCallback((auth: { email: string | null; authorized: boolean | null }) => {
      setAuthState({
        email: auth.email,
        authorized: auth.authorized,
      });
    }, []);
  
    useEffect(() => {
      const loadAuth = () => {
        const token = localStorage.getItem("candidateToken");
        if (!token) {
            setAuthState({ email: null, authorized: null });
          return;
        }
  
        if (data?.authorized) {
            setAuthState({
            email: data.email ?? null,
            authorized: data.authorized ?? null,
          });
        } else {
            setAuthState({ email: null, authorized: false });
        }
      };
  
      loadAuth();
    }, [data]);
    return (
      <CandidateContext.Provider
        value={{
          ...auth,
          setAuth,
        }}
      >
        {children}
      </CandidateContext.Provider>
    );
  };
  
  export const useCandidate = (): CandidateState => useContext(CandidateContext);
  