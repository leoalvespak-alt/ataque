import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginData, CadastroData, AuthResponse } from '../types';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<boolean>;
  cadastro: (data: CadastroData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar token ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Verificar se o token ainda é válido
          const response = await authService.verificarToken(storedToken);
          if (response.valid) {
            setToken(storedToken);
            setUser(response.user);
          } else {
            // Token inválido, limpar dados
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Erro ao verificar token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData): Promise<boolean> => {
    try {
      setLoading(true);
      const response: AuthResponse = await authService.login(data);
      
      setUser(response.user);
      setToken(response.token);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success(response.message);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cadastro = async (data: CadastroData): Promise<boolean> => {
    try {
      setLoading(true);
      const response: AuthResponse = await authService.cadastro(data);
      
      setUser(response.user);
      setToken(response.token);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success(response.message);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer cadastro';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logout realizado com sucesso!');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    cadastro,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
