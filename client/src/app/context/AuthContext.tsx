import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, verifyToken } from '../api';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAction: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      verifyToken(storedToken).then((valid) => {
        if (valid) {
          setToken(storedToken);
        } else {
          localStorage.removeItem('auth_token');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginAction = async (username: string, password: string) => {
    const authToken = await login(username, password);
    setToken(authToken.access_token);
    localStorage.setItem('auth_token', authToken.access_token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        loginAction,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
