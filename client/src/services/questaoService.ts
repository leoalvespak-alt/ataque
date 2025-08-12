import axios from 'axios';
import { Questao, QuestaoFilters, PaginatedResponse, ComentarioAluno } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const questaoService = {
  // Buscar questões com filtros
  async buscarQuestoes(filters: QuestaoFilters = {}): Promise<PaginatedResponse<Questao>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/questions?${params.toString()}`);
    return response.data;
  },

  // Buscar questão específica
  async buscarQuestao(id: number): Promise<{ questao: Questao }> {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Responder questão
  async responderQuestao(id: number, data: { alternativa_marcada: 'A' | 'B' | 'C' | 'D' | 'E'; tempo_resposta?: number }): Promise<any> {
    const response = await api.post(`/questions/${id}/responder`, data);
    return response.data;
  },

  // Buscar comentários de uma questão
  async buscarComentarios(questaoId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<ComentarioAluno>> {
    const response = await api.get(`/questions/${questaoId}/comentarios?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Adicionar comentário
  async adicionarComentario(questaoId: number, texto: string): Promise<any> {
    const response = await api.post(`/questions/${questaoId}/comentarios`, { texto });
    return response.data;
  }
};
