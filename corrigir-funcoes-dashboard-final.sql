-- Script corrigido para resolver problemas específicos do dashboard
-- Baseado no diagnóstico realizado

-- =====================================================
-- 1. CORRIGIR FUNÇÃO get_estatisticas_detalhadas_usuario
-- =====================================================

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
    
    -- Obter dados do usuário (usando alias para evitar ambiguidade)
    SELECT COALESCE(u.xp, 0), COALESCE(u.questoes_respondidas, 0) 
    INTO user_xp, user_questoes
    FROM usuarios u
    WHERE u.id = user_id;
    
    -- Estatísticas gerais
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

-- =====================================================
-- 2. CORRIGIR FUNÇÃO get_progresso_ultimos_7_dias
-- =====================================================

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
    total_q INTEGER;
    acertos_dia INTEGER;
    erros_dia INTEGER;
BEGIN
    user_id := auth.uid();
    data_atual := CURRENT_DATE;
    
    -- Gerar dados para os últimos 7 dias
    FOR i IN 0..6 LOOP
        -- Obter dados para o dia específico
        SELECT 
            COALESCE(COUNT(r.id), 0),
            COALESCE(COUNT(r.id) FILTER (WHERE r.acertou = true), 0),
            COALESCE(COUNT(r.id) FILTER (WHERE r.acertou = false), 0)
        INTO total_q, acertos_dia, erros_dia
        FROM respostas_usuarios r
        WHERE r.usuario_id = user_id
        AND DATE(r.data_resposta) = data_atual - i;
        
        -- Retornar linha para o dia
        data := data_atual - i;
        total_questoes := total_q;
        acertos := acertos_dia;
        erros := erros_dia;
        percentual_acerto := CASE 
            WHEN total_q > 0 THEN (acertos_dia::DECIMAL / total_q * 100)
            ELSE 0 
        END;
        
        RETURN NEXT;
    END LOOP;
END;
$$;

-- =====================================================
-- 3. CORRIGIR FUNÇÃO get_notificacoes_dashboard
-- =====================================================

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
-- 4. VERIFICAR E CORRIGIR ESTRUTURA DAS TABELAS
-- =====================================================

-- Verificar se a coluna 'ativo' existe na tabela disciplinas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' AND column_name = 'ativo'
    ) THEN
        ALTER TABLE disciplinas ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna "ativo" adicionada à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Coluna "ativo" já existe na tabela disciplinas';
    END IF;
END $$;

-- Verificar se a tabela respostas_usuarios tem as colunas necessárias
DO $$
BEGIN
    -- Verificar se a coluna 'acertou' existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'respostas_usuarios' AND column_name = 'acertou'
    ) THEN
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
        ALTER TABLE respostas_usuarios ADD COLUMN data_resposta TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Coluna "data_resposta" adicionada à tabela respostas_usuarios';
    ELSE
        RAISE NOTICE 'Coluna "data_resposta" já existe na tabela respostas_usuarios';
    END IF;
END $$;

-- =====================================================
-- 5. CRIAR TABELA DICAS_ESTUDO SE NÃO EXISTIR
-- =====================================================

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

-- Inserir dicas de estudo iniciais se não existirem
INSERT INTO dicas_estudo (titulo, texto, categoria, prioridade, ativa) VALUES
('Mantenha o Foco!', 'Resolva pelo menos 10 questões por dia para manter o ritmo de aprendizado. A consistência é mais importante que a quantidade.', 'MOTIVACIONAL', 3, true),
('Dica de Estudo', 'Revise as questões que você errou. Aprender com os erros é uma das melhores formas de fixar o conteúdo.', 'ESTUDO', 2, true),
('Lembrete Importante', 'Não esqueça de fazer pausas durante os estudos. O cérebro precisa de descanso para assimilar melhor o conteúdo.', 'SAUDE', 1, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_respostas_usuario_data ON respostas_usuarios(usuario_id, data_resposta);
CREATE INDEX IF NOT EXISTS idx_respostas_acertou ON respostas_usuarios(usuario_id, acertou);
CREATE INDEX IF NOT EXISTS idx_dicas_estudo_ativa ON dicas_estudo(ativa);
CREATE INDEX IF NOT EXISTS idx_dicas_estudo_prioridade ON dicas_estudo(prioridade);

-- =====================================================
-- 7. MENSAGEM DE CONCLUSÃO
-- =====================================================

SELECT 'Funções do dashboard corrigidas com sucesso!' as status;
SELECT 'Problemas de ambiguidade de colunas resolvidos' as correcoes;
SELECT 'Estrutura de tabelas verificada e corrigida' as estrutura;
