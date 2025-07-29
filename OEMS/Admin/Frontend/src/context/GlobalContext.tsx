import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import { checkAuth as fetchAuthStatus } from "../Services/adminService";

interface AuthState {
  isAdmin: boolean;
  name: string | null;
  email: string | null;
  loading: boolean;
  userId: string | null;
  setAuth: (auth: {
    isAdmin: boolean;
    name: string | null;
    email: string | null;
    userId: string | null,
  }) => void;
}

const defaultAuthState: AuthState = {
  isAdmin: false,
  name: null,
  email: null,
  userId: null,
  loading: true,
  setAuth: () => {},
};

const AuthContext = createContext<AuthState>(defaultAuthState);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuthState] = useState<Omit<AuthState, "setAuth">>({
    isAdmin: false,
    name: null,
    email: null,
    userId: null,
    loading: true,
  });
  const location = useLocation();

  const setAuth = useCallback(
    (authData: {
      isAdmin: boolean;
      name: string | null;
      userId: string | null;
      email: string | null;
    }) => {
      setAuthState(() => ({ ...authData, loading: false }));
    },
    []
  );

  useEffect(() => {
    const publicPaths = ["/register", "/forgot-password"];
    const currentPath = location.pathname;
  
    if (publicPaths.includes(currentPath)) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      return;
    }
    const loadAuth = async () => {

      try {
        const data = await fetchAuthStatus();
        if (data.authorized) {
          setAuthState({
            isAdmin: true,
            name: data.name ?? null,
            userId: data.userId ?? null,
            email: data.email ?? null,
            loading: false,
          });
        } else {
          setAuthState({
            isAdmin: false,
            name: null,
            email: null,
            userId: null,
            loading: false,
          });
        }
      } catch (error) {
        setAuthState({
          isAdmin: false,
          name: null,
          userId: null,
          email: null,
          loading: false,
        });
      }
    };
      loadAuth();
    
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => useContext(AuthContext);
