import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginData, CadastroData, AuthResponse } from '../types';
import { supabase } from '../lib/supabase';

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

  // Verificar sessão ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');
        // Obter sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Sessão:', session);
        console.log('Erro:', error);
        
        if (session && !error) {
          setToken(session.access_token);
          
          // TEMPORÁRIO: Criar usuário básico sem buscar da tabela
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
          console.log('Usuário básico criado:', basicUser);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Mudança de autenticação:', event, session);
        try {
          if (event === 'SIGNED_IN' && session) {
            setToken(session.access_token);
            
            // TEMPORÁRIO: Criar usuário básico sem buscar da tabela
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
            console.log('Usuário básico criado no onAuthStateChange:', basicUser);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Erro no onAuthStateChange:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

    const login = async (data: LoginData): Promise<boolean> => {
    try {
      console.log('Iniciando login com:', data.email);
      setLoading(true);
      
      // Fazer login com Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.senha
      });
      
      console.log('Resposta do Supabase Auth:', { authData, error });
      
      if (error) {
        console.error('Erro no Supabase Auth:', error);
        throw error;
      }
      
              if (authData.session) {
          console.log('Sessão criada, criando usuário básico...');
          setToken(authData.session.access_token);
          
          // TEMPORÁRIO: Criar usuário básico sem buscar da tabela
          const basicUser = {
            id: authData.user.id,
            nome: authData.user.user_metadata?.nome || 'Usuário',
            email: authData.user.email || '',
            tipo_usuario: authData.user.user_metadata?.tipo_usuario || 'aluno',
            status: 'ativo',
            xp: 0,
            questoes_respondidas: 0,
            ultimo_login: null,
            profile_picture_url: null,
            ativo: true,
            created_at: authData.user.created_at,
            updated_at: authData.user.updated_at
          };
          
          setUser(basicUser);
          console.log('Login realizado com sucesso!');
          return true;
        } else {
        console.log('Nenhuma sessão criada');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      console.error('Erro no login:', errorMessage);
      return false;
    } finally {
      setLoading(false);
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
