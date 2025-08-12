import axios from 'axios';
import { LoginData, CadastroData, AuthResponse, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configurar axios com interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Cadastro
  async cadastro(data: CadastroData): Promise<AuthResponse> {
    const response = await api.post('/auth/cadastro', data);
    return response.data;
  },

  // Verificar token
  async verificarToken(token: string): Promise<{ valid: boolean; user?: User }> {
    const response = await api.get('/auth/verificar', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Atualizar perfil
  async atualizarPerfil(data: { nome: string }): Promise<{ message: string; user: User }> {
    const response = await api.put('/users/perfil', data);
    return response.data;
  },

  // Buscar perfil
  async buscarPerfil(): Promise<{ user: User }> {
    const response = await api.get('/users/perfil');
    return response.data;
  },

  // Buscar estatísticas
  async buscarEstatisticas(): Promise<any> {
    const response = await api.get('/users/estatisticas');
    return response.data;
  }
};
