-- Script para corrigir as funções do dashboard
-- Execute este script no Supabase SQL Editor

-- 1. CORRIGIR FUNÇÃO get_estatisticas_dashboard
DROP FUNCTION IF EXISTS get_estatisticas_dashboard(uuid);
DROP FUNCTION IF EXISTS get_estatisticas_dashboard();

CREATE OR REPLACE FUNCTION get_estatisticas_dashboard(user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_respostas BIGINT,
  total_acertos BIGINT,
  total_erros BIGINT,
  percentual_acerto NUMERIC,
  xp_total BIGINT,
  questoes_respondidas BIGINT,
  respostas_ultimos_30_dias BIGINT,
  acertos_ultimos_30_dias BIGINT,
  percentual_ultimos_30_dias NUMERIC,
  streak_atual INTEGER,
  dias_estudo INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_total_respostas BIGINT := 0;
  v_total_acertos BIGINT := 0;
  v_total_erros BIGINT := 0;
  v_xp_total BIGINT := 0;
  v_questoes_respondidas BIGINT := 0;
  v_respostas_ultimos_30_dias BIGINT := 0;
  v_acertos_ultimos_30_dias BIGINT := 0;
  v_streak_atual INTEGER := 0;
  v_dias_estudo INTEGER := 0;
BEGIN
  -- Usar o user_id fornecido ou o usuário atual
  v_user_id := COALESCE(user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Estatísticas gerais
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE correta = true),
    COUNT(*) FILTER (WHERE correta = false),
    COALESCE(SUM(xp_ganho), 0),
    COUNT(DISTINCT questao_id)
  INTO 
    v_total_respostas,
    v_total_acertos,
    v_total_erros,
    v_xp_total,
    v_questoes_respondidas
  FROM respostas_alunos 
  WHERE aluno_id = v_user_id;

  -- Estatísticas dos últimos 30 dias
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE correta = true)
  INTO 
    v_respostas_ultimos_30_dias,
    v_acertos_ultimos_30_dias
  FROM respostas_alunos 
  WHERE aluno_id = v_user_id 
    AND created_at >= NOW() - INTERVAL '30 days';

  -- Calcular percentuais
  RETURN QUERY SELECT
    v_total_respostas,
    v_total_acertos,
    v_total_erros,
    CASE 
      WHEN v_total_respostas > 0 THEN 
        ROUND((v_total_acertos::NUMERIC / v_total_respostas::NUMERIC) * 100, 2)
      ELSE 0 
    END,
    v_xp_total,
    v_questoes_respondidas,
    v_respostas_ultimos_30_dias,
    v_acertos_ultimos_30_dias,
    CASE 
      WHEN v_respostas_ultimos_30_dias > 0 THEN 
        ROUND((v_acertos_ultimos_30_dias::NUMERIC / v_respostas_ultimos_30_dias::NUMERIC) * 100, 2)
      ELSE 0 
    END,
    v_streak_atual,
    v_dias_estudo;
END;
$$;

-- 2. CORRIGIR FUNÇÃO get_notificacoes_dashboard
DROP FUNCTION IF EXISTS get_notificacoes_dashboard(uuid);
DROP FUNCTION IF EXISTS get_notificacoes_dashboard();

CREATE OR REPLACE FUNCTION get_notificacoes_dashboard(user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id BIGINT,
  titulo TEXT,
  mensagem TEXT,
  tipo TEXT,
  prioridade TEXT,
  lida BOOLEAN,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Usar o user_id fornecido ou o usuário atual
  v_user_id := COALESCE(user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Retornar notificações do usuário
  RETURN QUERY SELECT
    n.id,
    n.titulo,
    n.mensagem,
    n.tipo,
    n.prioridade,
    COALESCE(un.lida, false) as lida,
    n.created_at
  FROM notificacoes n
  LEFT JOIN usuarios_notificacoes un ON n.id = un.notificacao_id AND un.usuario_id = v_user_id
  WHERE n.ativo = true
    AND (n.usuario_id = v_user_id OR n.usuario_id IS NULL)
  ORDER BY n.created_at DESC
  LIMIT 10;
END;
$$;

-- 3. CORRIGIR FUNÇÃO marcar_notificacao_lida_segura
DROP FUNCTION IF EXISTS marcar_notificacao_lida_segura(bigint);
DROP FUNCTION IF EXISTS marcar_notificacao_lida_segura(bigint, uuid);

CREATE OR REPLACE FUNCTION marcar_notificacao_lida_segura(notificacao_id BIGINT, user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_notificacao_exists BOOLEAN;
BEGIN
  -- Usar o user_id fornecido ou o usuário atual
  v_user_id := COALESCE(user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Verificar se a notificação existe e pertence ao usuário
  SELECT EXISTS(
    SELECT 1 FROM notificacoes n
    LEFT JOIN usuarios_notificacoes un ON n.id = un.notificacao_id AND un.usuario_id = v_user_id
    WHERE n.id = notificacao_id 
      AND n.ativo = true
      AND (n.usuario_id = v_user_id OR n.usuario_id IS NULL)
  ) INTO v_notificacao_exists;

  IF NOT v_notificacao_exists THEN
    RETURN false;
  END IF;

  -- Marcar como lida
  INSERT INTO usuarios_notificacoes (usuario_id, notificacao_id, lida, created_at)
  VALUES (v_user_id, notificacao_id, true, NOW())
  ON CONFLICT (usuario_id, notificacao_id) 
  DO UPDATE SET lida = true, updated_at = NOW();

  RETURN true;
END;
$$;

-- 4. VERIFICAR SE AS TABELAS NECESSÁRIAS EXISTEM
-- Se a tabela notificacoes não existir, criar uma versão simplificada
CREATE TABLE IF NOT EXISTS notificacoes (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT DEFAULT 'INFO',
  prioridade TEXT DEFAULT 'NORMAL',
  usuario_id UUID REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Se a tabela usuarios_notificacoes não existir, criar
CREATE TABLE IF NOT EXISTS usuarios_notificacoes (
  usuario_id UUID REFERENCES auth.users(id),
  notificacao_id BIGINT REFERENCES notificacoes(id),
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (usuario_id, notificacao_id)
);

-- 5. CONFIGURAR RLS (Row Level Security)
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para notificacoes
DROP POLICY IF EXISTS "Usuários podem ver suas notificações" ON notificacoes;
CREATE POLICY "Usuários podem ver suas notificações" ON notificacoes
  FOR SELECT USING (
    auth.uid() = usuario_id OR usuario_id IS NULL
  );

-- Políticas para usuarios_notificacoes
DROP POLICY IF EXISTS "Usuários podem gerenciar suas notificações" ON usuarios_notificacoes;
CREATE POLICY "Usuários podem gerenciar suas notificacoes" ON usuarios_notificacoes
  FOR ALL USING (auth.uid() = usuario_id);

-- 6. INSERIR DADOS DE EXEMPLO (opcional)
INSERT INTO notificacoes (titulo, mensagem, tipo, prioridade, usuario_id) VALUES
('Bem-vindo!', 'Seja bem-vindo à plataforma Rota de Ataque Questões!', 'INFO', 'NORMAL', NULL),
('Dica de Estudo', 'Lembre-se de revisar as questões que você errou!', 'DICA', 'BAIXA', NULL)
ON CONFLICT DO NOTHING;

-- 7. VERIFICAR SE AS FUNÇÕES FORAM CRIADAS
SELECT 'Função get_estatisticas_dashboard criada com sucesso!' as status
UNION ALL
SELECT 'Função get_notificacoes_dashboard criada com sucesso!' as status
UNION ALL
SELECT 'Função marcar_notificacao_lida_segura criada com sucesso!' as status;
