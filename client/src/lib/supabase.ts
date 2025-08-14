import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8'

// Criar cliente Supabase
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Configurações adicionais
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'rota-de-ataque-questoes'
    }
  }
}

// Cliente com configurações personalizadas
export const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)

// Funções auxiliares para o banco de dados
export const db = {
  // Disciplinas
  disciplinas: () => supabase.from('disciplinas'),
  
  // Assuntos
  assuntos: () => supabase.from('assuntos'),
  
  // Bancas
  bancas: () => supabase.from('bancas'),
  
  // Escolaridades
  escolaridades: () => supabase.from('escolaridades'),
  
  // Anos
  anos: () => supabase.from('anos'),
  
  // Órgãos
  orgaos: () => supabase.from('orgaos'),
  
  // Questões
  questoes: () => supabase.from('questoes'),
  
  // Alternativas
  alternativas: () => supabase.from('alternativas'),
  
  // Usuários
  usuarios: () => supabase.from('usuarios'),
  
  // Respostas de alunos
  respostasAlunos: () => supabase.from('respostas_alunos'),
  
  // Comentários de questões
  comentariosQuestoes: () => supabase.from('comentarios_questoes'),
  
  // Cadernos
  cadernos: () => supabase.from('cadernos'),
  
  // Cadernos questões
  cadernosQuestoes: () => supabase.from('cadernos_questoes')
}

// Funções de autenticação
export const auth = {
  // Login
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },
  
  // Cadastro
  signUp: async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },
  
  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  
  // Verificar sessão atual
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },
  
  // Obter usuário atual
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },
  
  // Escutar mudanças de autenticação
  onAuthStateChange: (callback: any) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funções específicas da aplicação
export const app = {
  // Buscar questões com filtros
  buscarQuestoes: async (filtros: any = {}) => {
    let query = supabase
      .from('questoes')
      .select(`
        *,
        disciplina:disciplinas(nome),
        assunto:assuntos(nome),
        banca:bancas(nome),
        orgao:orgaos(nome),
        alternativas(*)
      `)
    
    // Aplicar filtros
    if (filtros.disciplina_id) {
      query = query.eq('disciplina_id', filtros.disciplina_id)
    }
    if (filtros.assunto_id) {
      query = query.eq('assunto_id', filtros.assunto_id)
    }
    if (filtros.banca_id) {
      query = query.eq('banca_id', filtros.banca_id)
    }
    if (filtros.ano_id) {
      query = query.eq('ano_id', filtros.ano_id)
    }
    if (filtros.escolaridade_id) {
      query = query.eq('escolaridade_id', filtros.escolaridade_id)
    }
    if (filtros.orgao_id) {
      query = query.eq('orgao_id', filtros.orgao_id)
    }
    if (filtros.tipo_questao) {
      query = query.eq('tipo_questao', filtros.tipo_questao)
    }
    if (filtros.limit) {
      query = query.limit(filtros.limit)
    }
    if (filtros.offset) {
      query = query.range(filtros.offset, filtros.offset + (filtros.limit || 10) - 1)
    }
    
    const { data, error } = await query
    return { data, error }
  },
  
  // Buscar questão específica
  buscarQuestao: async (id: string) => {
    const { data, error } = await supabase
      .from('questoes')
      .select(`
        *,
        disciplina:disciplinas(nome),
        assunto:assuntos(nome),
        banca:bancas(nome),
        orgao:orgaos(nome),
        alternativas(*),
        comentarios:comentarios_questoes(
          *,
          aluno:usuarios(nome)
        )
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },
  
  // Responder questão
  responderQuestao: async (questaoId: string, resposta: string, correta: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: 'Usuário não autenticado' } }
    }
    
    const { data, error } = await supabase
      .from('respostas_alunos')
      .insert({
        aluno_id: user.id,
        questao_id: questaoId,
        resposta_selecionada: resposta,
        correta: correta
      })
    
    return { data, error }
  },
  
  // Adicionar comentário
  adicionarComentario: async (questaoId: string, texto: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: 'Usuário não autenticado' } }
    }
    
    const { data, error } = await supabase
      .from('comentarios_questoes')
      .insert({
        questao_id: questaoId,
        aluno_id: user.id,
        texto_comentario: texto
      })
    
    return { data, error }
  },
  
  // Criar caderno
  criarCaderno: async (nome: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: 'Usuário não autenticado' } }
    }
    
    const { data, error } = await supabase
      .from('cadernos')
      .insert({
        aluno_id: user.id,
        nome: nome
      })
    
    return { data, error }
  },
  
  // Adicionar questão ao caderno
  adicionarQuestaoCaderno: async (cadernoId: string, questaoId: string) => {
    const { data, error } = await supabase
      .from('cadernos_questoes')
      .insert({
        caderno_id: cadernoId,
        questao_id: questaoId
      })
    
    return { data, error }
  },
  
  // Buscar cadernos do usuário
  buscarCadernos: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: 'Usuário não autenticado' } }
    }
    
    const { data, error } = await supabase
      .from('cadernos')
      .select(`
        *,
        questoes:cadernos_questoes(
          questao:questoes(
            *,
            disciplina:disciplinas(nome),
            assunto:assuntos(nome)
          )
        )
      `)
      .eq('aluno_id', user.id)
    
    return { data, error }
  }
}

export default supabase
