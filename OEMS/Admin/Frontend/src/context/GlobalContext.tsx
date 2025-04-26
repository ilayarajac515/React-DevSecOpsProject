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
  loading: boolean; // 👉 ADD THIS
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
  loading: true, // 👉 initially loading
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
    loading: true, // 👉 initially true
  });

  const setAuth = useCallback(
    (authData: {
      authorized: boolean;
      name: string | null;
      email: string | null;
    }) => {
      setAuthState({
        ...authData,
        loading: false,
      });
    },
    []
  );

  useEffect(() => {
    const loadAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setAuth({ authorized: false, name: null, email: null });
        return;
      }
  
      try {
        const token = localStorage.getItem("accessToken");

        if (token) {
          const data = await fetchAuthStatus();
          const userName = data.name ?? null;

          if (data.authorized) {
            setAuth({
              authorized: true,
              name: userName,
              email: data.email ?? null,
            });
          } else {
            setAuth({ authorized: false, name: null, email: null });
          }
        const data = await fetchAuthStatus();
        const userName = data.name ?? null;
        if (data.authorized) {
          setAuth({
            authorized: true,
            name: userName,
            email: data.email ?? null,
          });
        } else {
          setAuth({ authorized: false, name: null, email: null });
        }
      } catch (error) {
        // Handle error: maybe log it or display a fallback UI
        console.error("Auth check failed", error);
        setAuth({ authorized: false, name: null, email: null });
      }
    };

    loadAuth();
  }, [setAuth]);
  
    loadAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => useContext(AuthContext);
