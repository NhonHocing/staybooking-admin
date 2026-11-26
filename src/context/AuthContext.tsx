import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService, type AdminUser } from '../services/authService';

interface AuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() =>
    authService.currentAdmin(),
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (authService.isAuthenticated()) {
        const ok = await authService.refresh();
        if (active) {
          setAdmin(ok ? authService.currentAdmin() : null);
        }
      } else if (active) {
        setAdmin(null);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await authService.login(email, password);
    setAdmin(loggedIn);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng trong AuthProvider');
  return ctx;
}

