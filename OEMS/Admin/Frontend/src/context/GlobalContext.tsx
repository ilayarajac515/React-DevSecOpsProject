import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { checkAuth as fetchAuthStatus } from "../Services/UserService";

interface AuthState {
  authorized: boolean;
  name: string | null;
  email: string | null;
  loading: boolean;
  setAuth: (auth: {
    authorized: boolean;
    name: string | null;
    email: string | null;
  }) => void;
}

const defaultAuthState: AuthState = {
  authorized: false,
  name: null,
  email: null,
  loading: true,
  setAuth: () => {},
};

const AuthContext = createContext<AuthState>(defaultAuthState);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuthState] = useState<Omit<AuthState, "setAuth">>({
    authorized: false,
    name: null,
    email: null,
    loading: true,
  });

  const setAuth = useCallback(
    (authData: { authorized: boolean; name: string | null; email: string | null }) => {
      setAuthState(() => ({ ...authData, loading: false }));
    },
    []
  );

  useEffect(() => {
    const loadAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setAuthState({ authorized: false, name: null, email: null, loading: false });
        return;
      }

      try {
        const data = await fetchAuthStatus();
        if (data.authorized) {
          setAuthState({
            authorized: true,
            name: data.name ?? null,
            email: data.email ?? null,
            loading: false,
          });
        } else {
          setAuthState({ authorized: false, name: null, email: null, loading: false });
        }
      } catch (error) {
        setAuthState({ authorized: false, name: null, email: null, loading: false });
      }
    };

    loadAuth();
  }, [setAuth]);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => useContext(AuthContext);
