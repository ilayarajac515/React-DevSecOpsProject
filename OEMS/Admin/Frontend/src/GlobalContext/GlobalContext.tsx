import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";
  import { checkAuth as fetchAuthStatus } from "../Services/UserService";
  
  interface AuthState {
    authorized: boolean;
    name: string | null;
    setAuth: (auth: { authorized: boolean; name: string | null }) => void;
  }
  
  const defaultAuthState: AuthState = {
    authorized: false,
    name: null,
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
    });
  
    const setAuth = (authData: { authorized: boolean; name: string | null }) => {
      setAuthState(authData);
    };
  
    useEffect(() => {
      const loadAuth = async () => {
        try {
          const data = await fetchAuthStatus();
  
          if (data.authorized) {
            setAuth({ authorized: true, name: data.name ?? null });
          } else {
            setAuth({ authorized: false, name: null });
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          setAuth({ authorized: false, name: null });
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
  