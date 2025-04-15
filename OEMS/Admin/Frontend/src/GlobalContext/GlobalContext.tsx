import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
  } from "react";
  
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
  
    return (
      <AuthContext.Provider value={{ ...auth, setAuth }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = (): AuthState => useContext(AuthContext);
  