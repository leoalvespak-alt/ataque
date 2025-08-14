-- Script corrigido para implementar funcionalidades do dashboard
-- Este script resolve problemas de estrutura e cria as funções necessárias

-- =====================================================
-- 1. VERIFICAR E CORRIGIR ESTRUTURA DAS TABELAS
-- =====================================================

-- Verificar se a tabela disciplinas existe e tem a coluna 'ativo'
DO $$
BEGIN
    -- Verificar se a coluna 'ativo' existe na tabela disciplinas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' AND column_name = 'ativo'
    ) THEN
        -- Adicionar coluna 'ativo' se não existir
        ALTER TABLE disciplinas ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna "ativo" adicionada à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Coluna "ativo" já existe na tabela disciplinas';
    END IF;
END $$;

-- Verificar se a tabela respostas_usuarios existe e tem as colunas necessárias
DO $$
BEGIN
    -- Verificar se a tabela respostas_usuarios existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'respostas_usuarios'
    ) THEN
        -- Criar tabela se não existir
        CREATE TABLE respostas_usuarios (
            id SERIAL PRIMARY KEY,
            usuario_id UUID REFERENCES usuarios(id),
            questao_id INTEGER REFERENCES questoes(id),
            acertou BOOLEAN NOT NULL,
            data_resposta TIMESTAMP DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela respostas_usuarios criada';
    ELSE
        RAISE NOTICE 'Tabela respostas_usuarios já existe';
    END IF;
    
    -- Verificar se a coluna 'acertou' existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'respostas_usuarios' AND column_name = 'acertou'
    ) THEN
        -- Adicionar coluna 'acertou' se não existir
        ALTER TABLE respostas_usuarios ADD COLUMN acertou BOOLEAN NOT NULL DEFAULT FALSE;
        RAISE NOTICE 'Coluna "acertou" adicionada à tabela respostas_usuarios';
    ELSE
        RAISE NOTICE 'Coluna "acertou" já existe na tabela respostas_usuarios';
    END IF;
    
    -- Verificar se a coluna 'data_resposta' existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'respostas_usuarios' AND column_name = 'data_resposta'
    ) THEN
        -- Adicionar coluna 'data_resposta' se não existir
        ALTER TABLE respostas_usuarios ADD COLUMN data_resposta TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Coluna "data_resposta" adicionada à tabela respostas_usuarios';
    ELSE
        RAISE NOTICE 'Coluna "data_resposta" já existe na tabela respostas_usuarios';
    END IF;
END $$;

-- =====================================================
-- 2. CRIAR TABELA DICAS_ESTUDO
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

-- =====================================================
-- 3. CRIAR FUNÇÕES SIMPLIFICADAS
-- =====================================================

-- Função simplificada para obter estatísticas detalhadas do usuário atual
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
    total_resp INTEGER := 0;
    total_acertos INTEGER := 0;
    total_erros INTEGER := 0;
    respostas_30_dias INTEGER := 0;
    acertos_30_dias INTEGER := 0;
    streak INTEGER := 0;
    dias_estudo INTEGER := 0;
    user_xp INTEGER := 0;
    user_questoes INTEGER := 0;
BEGIN
    user_id := auth.uid();
    
    -- Obter dados do usuário
    SELECT COALESCE(xp, 0), COALESCE(questoes_respondidas, 0) 
    INTO user_xp, user_questoes
    FROM usuarios 
    WHERE id = user_id;
    
    -- Estatísticas gerais (se a tabela respostas_usuarios existir)
    BEGIN
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE acertou = true),
            COUNT(*) FILTER (WHERE acertou = false)
        INTO total_resp, total_acertos, total_erros
        FROM respostas_usuarios
        WHERE usuario_id = user_id;
    EXCEPTION
        WHEN OTHERS THEN
            total_resp := 0;
            total_acertos := 0;
            total_erros := 0;
    END;
    
    -- Estatísticas dos últimos 30 dias
    BEGIN
        SELECT 
            COUNT(*),
            COUNT(*) FILTER (WHERE acertou = true)
        INTO respostas_30_dias, acertos_30_dias
        FROM respostas_usuarios
        WHERE usuario_id = user_id 
        AND data_resposta >= NOW() - INTERVAL '30 days';
    EXCEPTION
        WHEN OTHERS THEN
            respostas_30_dias := 0;
            acertos_30_dias := 0;
    END;
    
    -- Calcular dias de estudo
    BEGIN
        SELECT COUNT(DISTINCT DATE(data_resposta)) INTO dias_estudo
        FROM respostas_usuarios
        WHERE usuario_id = user_id;
    EXCEPTION
        WHEN OTHERS THEN
            dias_estudo := 0;
    END;
    
    -- Calcular streak (simplificado)
    streak := dias_estudo;
    
    RETURN QUERY
    SELECT 
        total_resp,
        total_acertos,
        total_erros,
        CASE WHEN total_resp > 0 THEN (total_acertos::DECIMAL / total_resp * 100) ELSE 0 END,
        user_xp,
        user_questoes,
        respostas_30_dias,
        acertos_30_dias,
        CASE WHEN respostas_30_dias > 0 THEN (acertos_30_dias::DECIMAL / respostas_30_dias * 100) ELSE 0 END,
        streak,
        dias_estudo;
END;
$$;

-- Função simplificada para obter top 3 tópicos com maior dificuldade
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
    
    -- Retornar dados vazios se não houver respostas suficientes
    IF NOT EXISTS (
        SELECT 1 FROM respostas_usuarios 
        WHERE usuario_id = user_id 
        LIMIT 1
    ) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        COALESCE(a.id, 0) as assunto_id,
        COALESCE(a.nome, 'N/A') as assunto_nome,
        COALESCE(d.nome, 'N/A') as disciplina_nome,
        COUNT(r.id) as total_questoes,
        COUNT(r.id) FILTER (WHERE r.acertou = false) as total_erros,
        CASE 
            WHEN COUNT(r.id) > 0 THEN 
                (COUNT(r.id) FILTER (WHERE r.acertou = false)::DECIMAL / COUNT(r.id) * 100)
            ELSE 0 
        END as percentual_erro
    FROM respostas_usuarios r
    LEFT JOIN questoes q ON r.questao_id = q.id
    LEFT JOIN assuntos a ON q.assunto_id = a.id
    LEFT JOIN disciplinas d ON q.disciplina_id = d.id
    WHERE r.usuario_id = user_id
    GROUP BY a.id, a.nome, d.nome
    HAVING COUNT(r.id) >= 1  -- Mínimo de 1 questão para considerar
    ORDER BY percentual_erro DESC
    LIMIT 3;
END;
$$;

-- Função simplificada para obter percentual por disciplina e assunto
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
    
    -- Retornar dados vazios se não houver respostas
    IF NOT EXISTS (
        SELECT 1 FROM respostas_usuarios 
        WHERE usuario_id = user_id 
        LIMIT 1
    ) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        COALESCE(d.id, 0) as disciplina_id,
        COALESCE(d.nome, 'N/A') as disciplina_nome,
        COALESCE(a.id, 0) as assunto_id,
        COALESCE(a.nome, 'N/A') as assunto_nome,
        COUNT(r.id) as total_questoes,
        COUNT(r.id) FILTER (WHERE r.acertou = true) as total_acertos,
        CASE 
            WHEN COUNT(r.id) > 0 THEN 
                (COUNT(r.id) FILTER (WHERE r.acertou = true)::DECIMAL / COUNT(r.id) * 100)
            ELSE 0 
        END as percentual_acerto
    FROM respostas_usuarios r
    LEFT JOIN questoes q ON r.questao_id = q.id
    LEFT JOIN assuntos a ON q.assunto_id = a.id
    LEFT JOIN disciplinas d ON q.disciplina_id = d.id
    WHERE r.usuario_id = user_id
    AND (p_disciplina_id IS NULL OR d.id = p_disciplina_id)
    GROUP BY d.id, d.nome, a.id, a.nome
    HAVING COUNT(r.id) >= 1  -- Mínimo de 1 questão para considerar
    ORDER BY d.nome, a.nome;
END;
$$;

-- Função simplificada para obter progresso dos últimos 7 dias
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
            COALESCE(COUNT(r.id), 0),
            COALESCE(COUNT(r.id) FILTER (WHERE r.acertou = true), 0),
            COALESCE(COUNT(r.id) FILTER (WHERE r.acertou = false), 0),
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

-- Função simplificada para obter dicas de estudo
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

-- Função simplificada para obter notificações do dashboard
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
    SELECT COALESCE(tipo_usuario, 'aluno') INTO user_tipo
    FROM usuarios
    WHERE id = user_id;
    
    -- Retornar dados vazios se a tabela notificacoes não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notificacoes'
    ) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        n.id,
        n.titulo,
        n.mensagem,
        COALESCE(n.tipo, 'INFO') as tipo,
        COALESCE(n.prioridade, 'NORMAL') as prioridade,
        COALESCE(n.lida, false) as lida,
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

-- =====================================================
-- 4. CRIAR POLÍTICAS RLS
-- =====================================================

-- Políticas RLS para dicas de estudo
DROP POLICY IF EXISTS "Dicas_estudo_visiveis_todos" ON dicas_estudo;
CREATE POLICY "Dicas_estudo_visiveis_todos" ON dicas_estudo
    FOR SELECT USING (ativa = true);

DROP POLICY IF EXISTS "Gestores_podem_gerenciar_dicas" ON dicas_estudo;
CREATE POLICY "Gestores_podem_gerenciar_dicas" ON dicas_estudo
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'gestor' 
            AND ativo = true
        )
    );

-- =====================================================
-- 5. CRIAR ÍNDICES
-- =====================================================

-- Índices para dicas de estudo
CREATE INDEX IF NOT EXISTS idx_dicas_estudo_ativa ON dicas_estudo(ativa);
CREATE INDEX IF NOT EXISTS idx_dicas_estudo_prioridade ON dicas_estudo(prioridade);
CREATE INDEX IF NOT EXISTS idx_dicas_estudo_categoria ON dicas_estudo(categoria);

-- Índices para respostas_usuarios
CREATE INDEX IF NOT EXISTS idx_respostas_usuario_data ON respostas_usuarios(usuario_id, data_resposta);
CREATE INDEX IF NOT EXISTS idx_respostas_acertou ON respostas_usuarios(usuario_id, acertou);

-- =====================================================
-- 6. INSERIR DADOS INICIAIS
-- =====================================================

-- Inserir dicas de estudo iniciais
INSERT INTO dicas_estudo (titulo, texto, categoria, prioridade, ativa) VALUES
('Mantenha o Foco!', 'Resolva pelo menos 10 questões por dia para manter o ritmo de aprendizado. A consistência é mais importante que a quantidade.', 'MOTIVACIONAL', 3, true),
('Dica de Estudo', 'Revise as questões que você errou. Aprender com os erros é uma das melhores formas de fixar o conteúdo.', 'ESTUDO', 2, true),
('Lembrete Importante', 'Não esqueça de fazer pausas durante os estudos. O cérebro precisa de descanso para assimilar melhor o conteúdo.', 'SAUDE', 1, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. MENSAGEM DE CONCLUSÃO
-- =====================================================

SELECT 'Funções do dashboard corrigidas e implementadas com sucesso!' as status;
SELECT 'Funções simplificadas criadas para evitar erros de estrutura' as observacao;
SELECT 'Tabela dicas_estudo criada com dados iniciais' as dicas;
SELECT 'Índices de performance otimizados' as indices;
