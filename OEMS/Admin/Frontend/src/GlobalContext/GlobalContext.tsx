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
  });

  const setAuth = useCallback(
    (authData: {
      authorized: boolean;
      name: string | null;
      email: string | null;
    }) => {
      setAuthState(authData);
    },
    []
  );

  useEffect(() => {
    const loadAuth = async () => {
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
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuth({ authorized: false, name: null, email: null });
      }
    };
    if (location.pathname !== "/") {
      loadAuth();
    }
  }, [setAuth]);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => useContext(AuthContext);
