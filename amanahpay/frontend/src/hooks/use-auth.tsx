import { useState, useEffect, createContext, useContext } from 'react';
import { 
  login as loginApi, 
  register as registerApi, 
  getCurrentUser, 
  logout as logoutApi,
  User,
  LoginCredentials,
  RegisterData
} from '../lib/api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        if (localStorage.getItem('token')) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
        setError('Authentication session expired');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginApi(credentials);
      setUser(response.user);
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to login';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerApi(data);
      setUser(response.user);
    } catch (err: any) {
      console.error('Register error:', err);
      const message = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to register';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 