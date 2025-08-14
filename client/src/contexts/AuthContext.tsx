import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginData, CadastroData, AuthResponse } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: any) => Promise<void>;
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
  const [initialized, setInitialized] = useState(false);

  // Verificar sessão ao inicializar
  useEffect(() => {
    if (initialized) return;

    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');
        // Obter sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && !error) {
          setToken(session.access_token);
          
          // Criar usuário básico sem buscar da tabela
          const basicUser = {
            id: session.user.id,
            nome: session.user.user_metadata?.nome || 'Usuário',
            email: session.user.email || '',
            tipo_usuario: session.user.user_metadata?.tipo_usuario || 'aluno',
            status: 'ativo',
            xp: 0,
            questoes_respondidas: 0,
            ultimo_login: null,
            profile_picture_url: null,
            ativo: true,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at
          };
          
          setUser(basicUser);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Mudança de autenticação:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setToken(session.access_token);
          
          // Criar usuário básico sem buscar da tabela
          const basicUser = {
            id: session.user.id,
            nome: session.user.user_metadata?.nome || 'Usuário',
            email: session.user.email || '',
            tipo_usuario: session.user.user_metadata?.tipo_usuario || 'aluno',
            status: 'ativo',
            xp: 0,
            questoes_respondidas: 0,
            ultimo_login: null,
            profile_picture_url: null,
            ativo: true,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at
          };
          
          setUser(basicUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setToken(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  const login = async (user: any): Promise<void> => {
    try {
      setToken(user.access_token);
      
      // Criar usuário básico
      const basicUser = {
        id: user.id,
        nome: user.user_metadata?.nome || 'Usuário',
        email: user.email || '',
        tipo_usuario: user.user_metadata?.tipo_usuario || 'aluno',
        status: 'ativo',
        xp: 0,
        questoes_respondidas: 0,
        ultimo_login: null,
        profile_picture_url: null,
        ativo: true,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      
      setUser(basicUser);
      console.log('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const cadastro = async (data: CadastroData): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Criar usuário no Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome: data.nome
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (authData.user) {
        // Criar registro na tabela usuarios
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user.id,
            nome: data.nome,
            email: data.email,
            tipo_usuario: 'aluno',
            status: 'gratuito',
            xp: 0,
            questoes_respondidas: 0
          })
          .select()
          .single();
        
        if (userData && !userError) {
          setUser(userData);
          if (authData.session) {
            setToken(authData.session.access_token);
          }
          console.log('Cadastro realizado com sucesso!');
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer cadastro';
      console.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      supabase.auth.signOut().then(({ error }) => {
        if (!error) {
          setUser(null);
          setToken(null);
          console.log('Logout realizado com sucesso!');
        }
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
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
