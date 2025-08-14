-- Script simples para corrigir as funções principais
-- Execute este SQL diretamente no painel do Supabase

-- 1. Remover funções existentes
DROP FUNCTION IF EXISTS get_estatisticas_dashboard(uuid);
DROP FUNCTION IF EXISTS get_estatisticas_dashboard();
DROP FUNCTION IF EXISTS get_estatisticas_por_disciplina(uuid);
DROP FUNCTION IF EXISTS get_estatisticas_por_disciplina();
DROP FUNCTION IF EXISTS get_estatisticas_por_assunto(integer, uuid);
DROP FUNCTION IF EXISTS get_estatisticas_por_assunto(integer);
DROP FUNCTION IF EXISTS get_notificacoes_dashboard(uuid);
DROP FUNCTION IF EXISTS get_notificacoes_dashboard();
DROP FUNCTION IF EXISTS marcar_notificacao_lida_segura(integer, uuid);
DROP FUNCTION IF EXISTS marcar_notificacao_lida_segura(integer);

-- 2. Criar função get_estatisticas_dashboard corrigida
CREATE FUNCTION get_estatisticas_dashboard(user_id UUID DEFAULT NULL)
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
) AS $$
BEGIN
    -- Se user_id não for fornecido, usar o usuário atual
    IF user_id IS NULL THEN
        user_id := auth.uid();
    END IF;

    RETURN QUERY
    WITH estatisticas_gerais AS (
        SELECT 
            COUNT(*) as total_respostas,
            COUNT(CASE WHEN acertou THEN 1 END) as total_acertos,
            COUNT(CASE WHEN NOT acertou THEN 1 END) as total_erros
        FROM respostas_usuarios 
        WHERE usuario_id = user_id
    ),
    estatisticas_ultimos_30_dias AS (
        SELECT 
            COUNT(*) as respostas_ultimos_30_dias,
            COUNT(CASE WHEN acertou THEN 1 END) as acertos_ultimos_30_dias
        FROM respostas_usuarios 
        WHERE usuario_id = user_id 
        AND created_at >= NOW() - INTERVAL '30 days'
    ),
    xp_total AS (
        SELECT COALESCE(SUM(xp_ganho), 0) as xp_total
        FROM respostas_usuarios 
        WHERE usuario_id = user_id
    ),
    streak_atual AS (
        SELECT COALESCE(MAX(streak_atual), 0) as streak_atual
        FROM usuarios 
        WHERE id = user_id
    ),
    dias_estudo AS (
        SELECT COUNT(DISTINCT DATE(created_at)) as dias_estudo
        FROM respostas_usuarios 
        WHERE usuario_id = user_id
    )
    SELECT 
        eg.total_respostas,
        eg.total_acertos,
        eg.total_erros,
        CASE 
            WHEN eg.total_respostas > 0 THEN 
                ROUND((eg.total_acertos::NUMERIC / eg.total_respostas::NUMERIC) * 100, 2)
            ELSE 0 
        END as percentual_acerto,
        xt.xp_total,
        eg.total_respostas as questoes_respondidas,
        e30.respostas_ultimos_30_dias,
        e30.acertos_ultimos_30_dias,
        CASE 
            WHEN e30.respostas_ultimos_30_dias > 0 THEN 
                ROUND((e30.acertos_ultimos_30_dias::NUMERIC / e30.respostas_ultimos_30_dias::NUMERIC) * 100, 2)
            ELSE 0 
        END as percentual_ultimos_30_dias,
        s.streak_atual,
        d.dias_estudo
    FROM estatisticas_gerais eg
    CROSS JOIN estatisticas_ultimos_30_dias e30
    CROSS JOIN xp_total xt
    CROSS JOIN streak_atual s
    CROSS JOIN dias_estudo d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função get_estatisticas_por_disciplina
CREATE FUNCTION get_estatisticas_por_disciplina(user_id UUID DEFAULT NULL)
RETURNS TABLE (
    disciplina_id INTEGER,
    disciplina_nome VARCHAR(255),
    total_questoes BIGINT,
    total_acertos BIGINT,
    percentual_acerto NUMERIC
) AS $$
BEGIN
    -- Se user_id não for fornecido, usar o usuário atual
    IF user_id IS NULL THEN
        user_id := auth.uid();
    END IF;

    RETURN QUERY
    SELECT 
        d.id as disciplina_id,
        d.nome as disciplina_nome,
        COUNT(*) as total_questoes,
        COUNT(CASE WHEN ru.acertou THEN 1 END) as total_acertos,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN ru.acertou THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as percentual_acerto
    FROM respostas_usuarios ru
    JOIN questoes q ON ru.questao_id = q.id
    JOIN disciplinas d ON q.disciplina_id = d.id
    WHERE ru.usuario_id = user_id
    GROUP BY d.id, d.nome
    ORDER BY total_questoes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar função get_estatisticas_por_assunto
CREATE FUNCTION get_estatisticas_por_assunto(disciplina_id INTEGER, user_id UUID DEFAULT NULL)
RETURNS TABLE (
    assunto_id INTEGER,
    assunto_nome VARCHAR(255),
    disciplina_nome VARCHAR(255),
    total_questoes BIGINT,
    total_acertos BIGINT,
    percentual_acerto NUMERIC
) AS $$
BEGIN
    -- Se user_id não for fornecido, usar o usuário atual
    IF user_id IS NULL THEN
        user_id := auth.uid();
    END IF;

    RETURN QUERY
    SELECT 
        a.id as assunto_id,
        a.nome as assunto_nome,
        d.nome as disciplina_nome,
        COUNT(*) as total_questoes,
        COUNT(CASE WHEN ru.acertou THEN 1 END) as total_acertos,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN ru.acertou THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as percentual_acerto
    FROM respostas_usuarios ru
    JOIN questoes q ON ru.questao_id = q.id
    JOIN assuntos a ON q.assunto_id = a.id
    JOIN disciplinas d ON q.disciplina_id = d.id
    WHERE ru.usuario_id = user_id AND q.disciplina_id = disciplina_id
    GROUP BY a.id, a.nome, d.nome
    ORDER BY total_questoes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar função get_notificacoes_dashboard
CREATE FUNCTION get_notificacoes_dashboard(user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    titulo VARCHAR(255),
    mensagem TEXT,
    tipo VARCHAR(50),
    prioridade VARCHAR(20),
    lida BOOLEAN,
    created_at TIMESTAMP
) AS $$
BEGIN
    -- Se user_id não for fornecido, usar o usuário atual
    IF user_id IS NULL THEN
        user_id := auth.uid();
    END IF;

    RETURN QUERY
    SELECT 
        n.id,
        n.titulo,
        n.mensagem,
        n.tipo,
        n.prioridade,
        COALESCE(un.lida, false) as lida,
        n.created_at
    FROM notificacoes n
    LEFT JOIN usuarios_notificacoes un ON n.id = un.notificacao_id AND un.usuario_id = user_id
    WHERE n.ativo = true
    ORDER BY n.prioridade DESC, n.created_at DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar função marcar_notificacao_lida_segura
CREATE FUNCTION marcar_notificacao_lida_segura(notificacao_id INTEGER, user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    -- Se user_id não for fornecido, usar o usuário atual
    IF user_id IS NULL THEN
        user_id := auth.uid();
    END IF;

    -- Inserir ou atualizar registro de notificação lida
    INSERT INTO usuarios_notificacoes (usuario_id, notificacao_id, lida, created_at)
    VALUES (user_id, notificacao_id, true, NOW())
    ON CONFLICT (usuario_id, notificacao_id) 
    DO UPDATE SET lida = true, updated_at = NOW();

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Adicionar colunas necessárias se não existirem
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS streak_atual INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_total INTEGER DEFAULT 0;

ALTER TABLE respostas_usuarios 
ADD COLUMN IF NOT EXISTS xp_ganho INTEGER DEFAULT 10;

-- 8. Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'get_estatisticas_dashboard',
    'get_estatisticas_por_disciplina', 
    'get_estatisticas_por_assunto',
    'get_notificacoes_dashboard',
    'marcar_notificacao_lida_segura'
)
ORDER BY routine_name;
