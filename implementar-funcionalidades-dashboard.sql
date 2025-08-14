-- Script para implementar funcionalidades do dashboard
-- Este script adiciona funções para estatísticas detalhadas, dicas de estudo e notificações

-- =====================================================
-- 1. FUNÇÕES PARA ESTATÍSTICAS DETALHADAS DO ALUNO
-- =====================================================

-- Função para obter estatísticas detalhadas do usuário atual
CREATE OR REPLACE FUNCTION get_estatisticas_detalhadas_usuario()
RETURNS TABLE (
    total_respostas INTEGER,
    total_acertos INTEGER,
    total_erros INTEGER,
    percentual_acerto DECIMAL(5,2),
    xp_total INTEGER,
    questoes_respondidas INTEGER,
    respostas_ultimos_30_dias INTEGER,
    acertos_ultimos_30_dias INTEGER,
    percentual_ultimos_30_dias DECIMAL(5,2),
    streak_atual INTEGER,
    dias_estudo INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    total_resp INTEGER;
    total_acertos INTEGER;
    total_erros INTEGER;
    respostas_30_dias INTEGER;
    acertos_30_dias INTEGER;
    streak INTEGER;
    dias_estudo INTEGER;
BEGIN
    user_id := auth.uid();
    
    -- Estatísticas gerais
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE acertou = true),
        COUNT(*) FILTER (WHERE acertou = false)
    INTO total_resp, total_acertos, total_erros
    FROM respostas_usuarios
    WHERE usuario_id = user_id;
    
    -- Estatísticas dos últimos 30 dias
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE acertou = true)
    INTO respostas_30_dias, acertos_30_dias
    FROM respostas_usuarios
    WHERE usuario_id = user_id 
    AND data_resposta >= NOW() - INTERVAL '30 days';
    
    -- Calcular streak atual (dias consecutivos de estudo)
    WITH dias_estudo AS (
        SELECT DISTINCT DATE(data_resposta) as dia
        FROM respostas_usuarios
        WHERE usuario_id = user_id
        ORDER BY dia DESC
    ),
    dias_consecutivos AS (
        SELECT dia,
               ROW_NUMBER() OVER (ORDER BY dia DESC) as rn,
               dia - ROW_NUMBER() OVER (ORDER BY dia DESC) as grupo
        FROM dias_estudo
    )
    SELECT COUNT(*) INTO streak
    FROM dias_consecutivos
    WHERE grupo = (SELECT grupo FROM dias_consecutivos WHERE rn = 1);
    
    -- Total de dias de estudo
    SELECT COUNT(DISTINCT DATE(data_resposta)) INTO dias_estudo
    FROM respostas_usuarios
    WHERE usuario_id = user_id;
    
    RETURN QUERY
    SELECT 
        total_resp,
        total_acertos,
        total_erros,
        CASE WHEN total_resp > 0 THEN (total_acertos::DECIMAL / total_resp * 100) ELSE 0 END,
        (SELECT xp FROM usuarios WHERE id = user_id),
        (SELECT questoes_respondidas FROM usuarios WHERE id = user_id),
        respostas_30_dias,
        acertos_30_dias,
        CASE WHEN respostas_30_dias > 0 THEN (acertos_30_dias::DECIMAL / respostas_30_dias * 100) ELSE 0 END,
        streak,
        dias_estudo;
END;
$$;

-- Função para obter top 3 tópicos com maior dificuldade
CREATE OR REPLACE FUNCTION get_topicos_maior_dificuldade()
RETURNS TABLE (
    assunto_id INTEGER,
    assunto_nome VARCHAR(255),
    disciplina_nome VARCHAR(255),
    total_questoes INTEGER,
    total_erros INTEGER,
    percentual_erro DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    user_id := auth.uid();
    
    RETURN QUERY
    SELECT 
        a.id as assunto_id,
        a.nome as assunto_nome,
        d.nome as disciplina_nome,
        COUNT(r.id) as total_questoes,
        COUNT(r.id) FILTER (WHERE r.acertou = false) as total_erros,
        CASE 
            WHEN COUNT(r.id) > 0 THEN 
                (COUNT(r.id) FILTER (WHERE r.acertou = false)::DECIMAL / COUNT(r.id) * 100)
            ELSE 0 
        END as percentual_erro
    FROM respostas_usuarios r
    JOIN questoes q ON r.questao_id = q.id
    JOIN assuntos a ON q.assunto_id = a.id
    JOIN disciplinas d ON q.disciplina_id = d.id
    WHERE r.usuario_id = user_id
    GROUP BY a.id, a.nome, d.nome
    HAVING COUNT(r.id) >= 5  -- Mínimo de 5 questões para considerar
    ORDER BY percentual_erro DESC
    LIMIT 3;
END;
$$;

-- Função para obter percentual de acertos por disciplina e assunto
CREATE OR REPLACE FUNCTION get_percentual_por_disciplina_assunto(p_disciplina_id INTEGER DEFAULT NULL)
RETURNS TABLE (
    disciplina_id INTEGER,
    disciplina_nome VARCHAR(255),
    assunto_id INTEGER,
    assunto_nome VARCHAR(255),
    total_questoes INTEGER,
    total_acertos INTEGER,
    percentual_acerto DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    user_id := auth.uid();
    
    RETURN QUERY
    SELECT 
        d.id as disciplina_id,
        d.nome as disciplina_nome,
        a.id as assunto_id,
        a.nome as assunto_nome,
        COUNT(r.id) as total_questoes,
        COUNT(r.id) FILTER (WHERE r.acertou = true) as total_acertos,
        CASE 
            WHEN COUNT(r.id) > 0 THEN 
                (COUNT(r.id) FILTER (WHERE r.acertou = true)::DECIMAL / COUNT(r.id) * 100)
            ELSE 0 
        END as percentual_acerto
    FROM respostas_usuarios r
    JOIN questoes q ON r.questao_id = q.id
    JOIN assuntos a ON q.assunto_id = a.id
    JOIN disciplinas d ON q.disciplina_id = d.id
    WHERE r.usuario_id = user_id
    AND (p_disciplina_id IS NULL OR d.id = p_disciplina_id)
    GROUP BY d.id, d.nome, a.id, a.nome
    HAVING COUNT(r.id) >= 3  -- Mínimo de 3 questões para considerar
    ORDER BY d.nome, a.nome;
END;
$$;

-- =====================================================
-- 2. TABELA E FUNÇÕES PARA DICAS DE ESTUDO
-- =====================================================

-- Criar tabela para dicas de estudo
CREATE TABLE IF NOT EXISTS dicas_estudo (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    texto TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL DEFAULT 'GERAL',
    prioridade INTEGER NOT NULL DEFAULT 1,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    criado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Políticas RLS para dicas de estudo
CREATE POLICY "Dicas_estudo_visiveis_todos" ON dicas_estudo
    FOR SELECT USING (ativa = true);

CREATE POLICY "Gestores_podem_gerenciar_dicas" ON dicas_estudo
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'gestor' 
            AND ativo = true
        )
    );

-- Função para obter dicas de estudo ativas
CREATE OR REPLACE FUNCTION get_dicas_estudo()
RETURNS TABLE (
    id INTEGER,
    titulo VARCHAR(255),
    texto TEXT,
    categoria VARCHAR(50),
    prioridade INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.titulo,
        d.texto,
        d.categoria,
        d.prioridade
    FROM dicas_estudo d
    WHERE d.ativa = true
    ORDER BY d.prioridade DESC, d.created_at DESC;
END;
$$;

-- Função para criar dica de estudo (apenas gestores)
CREATE OR REPLACE FUNCTION criar_dica_estudo(
    p_titulo VARCHAR(255),
    p_texto TEXT,
    p_categoria VARCHAR(50) DEFAULT 'GERAL',
    p_prioridade INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    dica_id INTEGER;
BEGIN
    -- Verificar se o usuário é gestor
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND tipo_usuario = 'gestor' 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Acesso negado: apenas gestores podem criar dicas de estudo';
    END IF;
    
    INSERT INTO dicas_estudo (titulo, texto, categoria, prioridade, criado_por)
    VALUES (p_titulo, p_texto, p_categoria, p_prioridade, auth.uid())
    RETURNING id INTO dica_id;
    
    RETURN dica_id;
END;
$$;

-- Função para atualizar dica de estudo (apenas gestores)
CREATE OR REPLACE FUNCTION atualizar_dica_estudo(
    p_id INTEGER,
    p_titulo VARCHAR(255),
    p_texto TEXT,
    p_categoria VARCHAR(50),
    p_prioridade INTEGER,
    p_ativa BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o usuário é gestor
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND tipo_usuario = 'gestor' 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Acesso negado: apenas gestores podem atualizar dicas de estudo';
    END IF;
    
    UPDATE dicas_estudo 
    SET 
        titulo = p_titulo,
        texto = p_texto,
        categoria = p_categoria,
        prioridade = p_prioridade,
        ativa = p_ativa,
        updated_at = NOW()
    WHERE id = p_id;
    
    RETURN FOUND;
END;
$$;

-- Função para excluir dica de estudo (apenas gestores)
CREATE OR REPLACE FUNCTION excluir_dica_estudo(p_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o usuário é gestor
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
        AND tipo_usuario = 'gestor' 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Acesso negado: apenas gestores podem excluir dicas de estudo';
    END IF;
    
    DELETE FROM dicas_estudo WHERE id = p_id;
    RETURN FOUND;
END;
$$;

-- =====================================================
-- 3. FUNÇÕES PARA NOTIFICAÇÕES DO DASHBOARD
-- =====================================================

-- Função para obter notificações do usuário atual para o dashboard
CREATE OR REPLACE FUNCTION get_notificacoes_dashboard()
RETURNS TABLE (
    id INTEGER,
    titulo VARCHAR(255),
    mensagem TEXT,
    tipo VARCHAR(50),
    prioridade VARCHAR(20),
    lida BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    user_tipo VARCHAR(20);
BEGIN
    user_id := auth.uid();
    
    -- Obter tipo do usuário
    SELECT tipo_usuario INTO user_tipo
    FROM usuarios
    WHERE id = user_id;
    
    RETURN QUERY
    SELECT 
        n.id,
        n.titulo,
        n.mensagem,
        n.tipo,
        n.prioridade,
        n.lida,
        n.created_at
    FROM notificacoes n
    WHERE n.ativa = true
    AND (
        n.usuario_id = user_id OR
        n.destinatario_tipo = 'TODOS' OR
        (n.destinatario_tipo = 'ALUNOS' AND user_tipo = 'aluno') OR
        (n.destinatario_tipo = 'GESTORES' AND user_tipo = 'gestor')
    )
    ORDER BY n.prioridade DESC, n.created_at DESC
    LIMIT 10;
END;
$$;

-- Função para contar notificações não lidas
CREATE OR REPLACE FUNCTION contar_notificacoes_nao_lidas_dashboard()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    user_tipo VARCHAR(20);
    total_nao_lidas INTEGER;
BEGIN
    user_id := auth.uid();
    
    -- Obter tipo do usuário
    SELECT tipo_usuario INTO user_tipo
    FROM usuarios
    WHERE id = user_id;
    
    SELECT COUNT(*) INTO total_nao_lidas
    FROM notificacoes n
    WHERE n.ativa = true
    AND n.lida = false
    AND (
        n.usuario_id = user_id OR
        n.destinatario_tipo = 'TODOS' OR
        (n.destinatario_tipo = 'ALUNOS' AND user_tipo = 'aluno') OR
        (n.destinatario_tipo = 'GESTORES' AND user_tipo = 'gestor')
    );
    
    RETURN total_nao_lidas;
END;
$$;

-- =====================================================
-- 4. FUNÇÕES PARA PROGRESSO DIÁRIO
-- =====================================================

-- Função para obter progresso dos últimos 7 dias
CREATE OR REPLACE FUNCTION get_progresso_ultimos_7_dias()
RETURNS TABLE (
    data DATE,
    total_questoes INTEGER,
    acertos INTEGER,
    erros INTEGER,
    percentual_acerto DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    data_atual DATE;
    i INTEGER;
BEGIN
    user_id := auth.uid();
    data_atual := CURRENT_DATE;
    
    -- Gerar dados para os últimos 7 dias
    FOR i IN 0..6 LOOP
        RETURN QUERY
        SELECT 
            data_atual - i,
            COUNT(r.id),
            COUNT(r.id) FILTER (WHERE r.acertou = true),
            COUNT(r.id) FILTER (WHERE r.acertou = false),
            CASE 
                WHEN COUNT(r.id) > 0 THEN 
                    (COUNT(r.id) FILTER (WHERE r.acertou = true)::DECIMAL / COUNT(r.id) * 100)
                ELSE 0 
            END
        FROM respostas_usuarios r
        WHERE r.usuario_id = user_id
        AND DATE(r.data_resposta) = data_atual - i;
    END LOOP;
END;
$$;

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para dicas de estudo
CREATE INDEX IF NOT EXISTS idx_dicas_estudo_ativa ON dicas_estudo(ativa);
CREATE INDEX IF NOT EXISTS idx_dicas_estudo_prioridade ON dicas_estudo(prioridade);
CREATE INDEX IF NOT EXISTS idx_dicas_estudo_categoria ON dicas_estudo(categoria);

-- Índices para respostas_usuarios (se não existirem)
CREATE INDEX IF NOT EXISTS idx_respostas_usuario_data ON respostas_usuarios(usuario_id, data_resposta);
CREATE INDEX IF NOT EXISTS idx_respostas_acertou ON respostas_usuarios(usuario_id, acertou);

-- =====================================================
-- 6. DADOS INICIAIS PARA DICAS DE ESTUDO
-- =====================================================

-- Inserir dicas de estudo iniciais (se não existirem)
INSERT INTO dicas_estudo (titulo, texto, categoria, prioridade, ativa) VALUES
('Mantenha o Foco!', 'Resolva pelo menos 10 questões por dia para manter o ritmo de aprendizado. A consistência é mais importante que a quantidade.', 'MOTIVACIONAL', 3, true),
('Dica de Estudo', 'Revise as questões que você errou. Aprender com os erros é uma das melhores formas de fixar o conteúdo.', 'ESTUDO', 2, true),
('Lembrete Importante', 'Não esqueça de fazer pausas durante os estudos. O cérebro precisa de descanso para assimilar melhor o conteúdo.', 'SAUDE', 1, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. TESTES DAS FUNÇÕES
-- =====================================================

-- Teste das funções (comentado para não executar automaticamente)
/*
-- Testar função de estatísticas detalhadas
SELECT * FROM get_estatisticas_detalhadas_usuario();

-- Testar função de tópicos com maior dificuldade
SELECT * FROM get_topicos_maior_dificuldade();

-- Testar função de percentual por disciplina
SELECT * FROM get_percentual_por_disciplina_assunto();

-- Testar função de dicas de estudo
SELECT * FROM get_dicas_estudo();

-- Testar função de notificações do dashboard
SELECT * FROM get_notificacoes_dashboard();

-- Testar função de progresso dos últimos 7 dias
SELECT * FROM get_progresso_ultimos_7_dias();
*/

-- =====================================================
-- 8. MENSAGEM DE CONCLUSÃO
-- =====================================================

SELECT 'Funcionalidades do dashboard implementadas com sucesso!' as status;
SELECT 'Funções de estatísticas detalhadas criadas' as estatisticas;
SELECT 'Sistema de dicas de estudo implementado' as dicas;
SELECT 'Funções de notificações do dashboard criadas' as notificacoes;
SELECT 'Índices de performance otimizados' as indices;
SELECT 'Dados iniciais de dicas inseridos' as dados_iniciais;
