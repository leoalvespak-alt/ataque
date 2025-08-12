// Tipos de usuário
export interface User {
  id: number;
  nome: string;
  email: string;
  status: 'gratuito' | 'premium';
  tipo_usuario: 'aluno' | 'gestor';
  xp: number;
  questoes_respondidas: number;
  ultimo_login?: string;
  created_at?: string;
  assinatura?: Assinatura;
}

// Tipos de categoria
export interface Disciplina {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface Assunto {
  id: number;
  nome: string;
  descricao?: string;
  disciplina_id: number;
  disciplina?: Disciplina;
  ativo: boolean;
}

export interface Banca {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface Orgao {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

// Tipos de questão
export interface Questao {
  id: number;
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_e?: string;
  gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
  comentario_professor?: string;
  ano: number;
  disciplina_id: number;
  assunto_id: number;
  banca_id: number;
  orgao_id: number;
  ativo: boolean;
  disciplina?: Disciplina;
  assunto?: Assunto;
  banca?: Banca;
  orgao?: Orgao;
}

// Tipos de resposta
export interface RespostaUsuario {
  id: number;
  usuario_id: number;
  questao_id: number;
  alternativa_marcada: 'A' | 'B' | 'C' | 'D' | 'E';
  acertou: boolean;
  tempo_resposta?: number;
  data_resposta: string;
  questao?: Questao;
}

// Tipos de comentário
export interface ComentarioAluno {
  id: number;
  texto: string;
  usuario_id: number;
  questao_id: number;
  aprovado: boolean;
  data_criacao: string;
  usuario?: User;
  questao?: Questao;
}

// Tipos de assinatura
export interface PlanoAssinatura {
  id: number;
  nome: string;
  preco: number;
  recorrencia: 'mensal' | 'anual';
  asaas_plan_id?: string;
  descricao?: string;
  beneficios?: string;
  ativo: boolean;
}

export interface AssinaturaUsuario {
  id: number;
  usuario_id: number;
  plano_id: number;
  asaas_subscription_id?: string;
  data_inicio: string;
  data_expiracao: string;
  status: 'ativa' | 'cancelada' | 'inadimplente' | 'expirada';
  valor_pago: number;
  proxima_cobranca?: string;
  plano?: PlanoAssinatura;
}

export interface Assinatura {
  plano: string;
  recorrencia: 'mensal' | 'anual';
  data_expiracao: string;
  proxima_cobranca?: string;
}

// Tipos de configuração
export interface ConfiguracaoPlataforma {
  id: number;
  chave: string;
  valor: string;
  descricao?: string;
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Tipos de filtros
export interface QuestaoFilters {
  disciplina_id?: number;
  assunto_id?: number;
  banca_id?: number;
  orgao_id?: number;
  ano?: number;
  page?: number;
  limit?: number;
}

// Tipos de ranking
export interface RankingEntry {
  posicao: number;
  id: number;
  nome: string;
  xp: number;
  status: 'gratuito' | 'premium';
}

export interface RankingResponse {
  tipo: 'geral' | 'mensal' | 'semanal';
  ranking: RankingEntry[];
}

// Tipos de estatísticas
export interface EstatisticasUsuario {
  totalRespostas: number;
  acertos: number;
  erros: number;
  taxaAcerto: number;
  questoesPorDisciplina: Record<string, {
    total: number;
    acertos: number;
    taxaAcerto: string;
  }>;
}

export interface UltimaResposta {
  disciplina: string;
  alternativa: 'A' | 'B' | 'C' | 'D' | 'E';
  acertou: boolean;
  data: string;
}

export interface EstatisticasResponse {
  estatisticas: EstatisticasUsuario;
  ultimasRespostas: UltimaResposta[];
}

// Tipos de autenticação
export interface LoginData {
  email: string;
  senha: string;
}

export interface CadastroData {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// Tipos de formulários
export interface NovaQuestaoData {
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_e?: string;
  gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
  ano: number;
  disciplina_id: number;
  assunto_id: number;
  banca_id: number;
  orgao_id: number;
  comentario_professor?: string;
}

// Tipos de dashboard admin
export interface DashboardStats {
  usuarios: {
    total: number;
    gratuitos: number;
    premium: number;
  };
  questoes: number;
  categorias: {
    disciplinas: number;
    assuntos: number;
    bancas: number;
    orgaos: number;
  };
  assinaturas: number;
  comentariosPendentes: number;
}
