-- Funções para estatísticas da plataforma
-- Execute este SQL diretamente no painel do Supabase

-- 1. Criar função para estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_estatisticas_dashboard(user_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_respostas BIGINT,
    acertos BIGINT,
    erros BIGINT,
    taxa_acerto NUMERIC,
    questoes_por_disciplina JSON
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
            COUNT(CASE WHEN acertou THEN 1 END) as acertos,
            COUNT(CASE WHEN NOT acertou THEN 1 END) as erros
        FROM respostas_usuarios 
        WHERE usuario_id = user_id
    ),
    estatisticas_disciplinas AS (
        SELECT 
            d.nome as disciplina,
            COUNT(*) as total,
            COUNT(CASE WHEN ru.acertou THEN 1 END) as acertos,
            ROUND(
                (COUNT(CASE WHEN ru.acertou THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2
            ) as taxa_acerto
        FROM respostas_usuarios ru
        JOIN questoes q ON ru.questao_id = q.id
        JOIN disciplinas d ON q.disciplina_id = d.id
        WHERE ru.usuario_id = user_id
        GROUP BY d.id, d.nome
        ORDER BY total DESC
    )
    SELECT 
        eg.total_respostas,
        eg.acertos,
        eg.erros,
        CASE 
            WHEN eg.total_respostas > 0 THEN 
                ROUND((eg.acertos::NUMERIC / eg.total_respostas::NUMERIC) * 100, 2)
            ELSE 0 
        END as taxa_acerto,
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'disciplina', disciplina,
                    'total', total,
                    'acertos', acertos,
                    'taxa_acerto', taxa_acerto
                )
            ) FROM estatisticas_disciplinas), 
            '[]'::json
        ) as questoes_por_disciplina
    FROM estatisticas_gerais eg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar função para estatísticas por disciplina
CREATE OR REPLACE FUNCTION get_estatisticas_por_disciplina(user_id UUID DEFAULT NULL)
RETURNS TABLE (
    disciplina_id INTEGER,
    disciplina_nome VARCHAR(255),
    total_questoes BIGINT,
    acertos BIGINT,
    erros BIGINT,
    taxa_acerto NUMERIC
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
        COUNT(CASE WHEN ru.acertou THEN 1 END) as acertos,
        COUNT(CASE WHEN NOT ru.acertou THEN 1 END) as erros,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN ru.acertou THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as taxa_acerto
    FROM respostas_usuarios ru
    JOIN questoes q ON ru.questao_id = q.id
    JOIN disciplinas d ON q.disciplina_id = d.id
    WHERE ru.usuario_id = user_id
    GROUP BY d.id, d.nome
    ORDER BY total_questoes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função para estatísticas por assunto
CREATE OR REPLACE FUNCTION get_estatisticas_por_assunto(disciplina_id INTEGER, user_id UUID DEFAULT NULL)
RETURNS TABLE (
    assunto_id INTEGER,
    assunto_nome VARCHAR(255),
    total_questoes BIGINT,
    acertos BIGINT,
    erros BIGINT,
    taxa_acerto NUMERIC
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
        COUNT(*) as total_questoes,
        COUNT(CASE WHEN ru.acertou THEN 1 END) as acertos,
        COUNT(CASE WHEN NOT ru.acertou THEN 1 END) as erros,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN ru.acertou THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as taxa_acerto
    FROM respostas_usuarios ru
    JOIN questoes q ON ru.questao_id = q.id
    JOIN assuntos a ON q.assunto_id = a.id
    WHERE ru.usuario_id = user_id AND q.disciplina_id = disciplina_id
    GROUP BY a.id, a.nome
    ORDER BY total_questoes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar tabela para configurações de logo/favicon
CREATE TABLE IF NOT EXISTS configuracoes_logo (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL UNIQUE, -- 'logo', 'favicon'
    url VARCHAR(500) NOT NULL,
    nome_arquivo VARCHAR(255),
    tamanho_bytes BIGINT,
    tipo_mime VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Inserir configurações padrão de logo
INSERT INTO configuracoes_logo (tipo, url, nome_arquivo, ativo) VALUES 
('logo', '/logo-ataque.svg', 'logo-ataque.svg', TRUE),
('favicon', '/favicon.svg', 'favicon.svg', TRUE)
ON CONFLICT (tipo) DO NOTHING;
