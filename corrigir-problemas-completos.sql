-- Script completo para corrigir todos os problemas identificados
-- Execute este SQL diretamente no painel do Supabase

-- 1. Criar bucket de storage para uploads se não existir
-- Nota: Buckets devem ser criados via interface do Supabase ou API

-- 2. Remover funções existentes primeiro (se existirem)
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

-- 3. Corrigir função get_estatisticas_dashboard
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

-- 4. Corrigir função get_estatisticas_por_disciplina
CREATE OR REPLACE FUNCTION get_estatisticas_por_disciplina(user_id UUID DEFAULT NULL)
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

-- 5. Corrigir função get_estatisticas_por_assunto
CREATE OR REPLACE FUNCTION get_estatisticas_por_assunto(disciplina_id INTEGER, user_id UUID DEFAULT NULL)
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

-- 6. Criar função para notificações do dashboard
CREATE OR REPLACE FUNCTION get_notificacoes_dashboard(user_id UUID DEFAULT NULL)
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

-- 7. Criar função para marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida_segura(notificacao_id INTEGER, user_id UUID DEFAULT NULL)
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

-- 8. Criar tabela de configurações de logo se não existir
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

-- 9. Inserir configurações padrão de logo
INSERT INTO configuracoes_logo (tipo, url, nome_arquivo, ativo) VALUES 
('logo', '/logo-ataque.svg', 'logo-ataque.svg', TRUE),
('favicon', '/favicon.svg', 'favicon.svg', TRUE)
ON CONFLICT (tipo) DO NOTHING;

-- 10. Criar tabela de notificações se não existir
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'GERAL',
    prioridade VARCHAR(20) DEFAULT 'NORMAL',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. Criar tabela de usuários_notificacoes se não existir
CREATE TABLE IF NOT EXISTS usuarios_notificacoes (
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notificacao_id INTEGER REFERENCES notificacoes(id) ON DELETE CASCADE,
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (usuario_id, notificacao_id)
);

-- 12. Criar tabela de dicas de estudo se não existir
CREATE TABLE IF NOT EXISTS dicas_estudo (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    texto TEXT NOT NULL,
    categoria VARCHAR(50) DEFAULT 'GERAL',
    prioridade INTEGER DEFAULT 1,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. Inserir algumas dicas de estudo padrão
INSERT INTO dicas_estudo (titulo, texto, categoria, prioridade, ativo) VALUES 
('Estude com Foco', 'Dedique 25 minutos de estudo focado, seguidos de 5 minutos de pausa. Esta técnica Pomodoro aumenta sua produtividade.', 'ESTUDO', 1, TRUE),
('Revise Regularmente', 'Faça revisões espaçadas do conteúdo. Revisar em intervalos crescentes (1 dia, 3 dias, 1 semana) melhora a retenção.', 'ESTUDO', 2, TRUE),
('Mantenha-se Motivado', 'Estabeleça metas pequenas e comemore cada conquista. O progresso constante é mais importante que a perfeição.', 'MOTIVACIONAL', 3, TRUE)
ON CONFLICT DO NOTHING;

-- 14. Adicionar colunas necessárias na tabela usuarios se não existirem
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS streak_atual INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_total INTEGER DEFAULT 0;

-- 15. Adicionar coluna xp_ganho na tabela respostas_usuarios se não existir
ALTER TABLE respostas_usuarios 
ADD COLUMN IF NOT EXISTS xp_ganho INTEGER DEFAULT 10;

-- 16. Configurar RLS (Row Level Security) para as tabelas
ALTER TABLE configuracoes_logo ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dicas_estudo ENABLE ROW LEVEL SECURITY;

-- 17. Criar políticas RLS para configuracoes_logo
DROP POLICY IF EXISTS "Configurações de logo são visíveis para todos" ON configuracoes_logo;
DROP POLICY IF EXISTS "Apenas gestores podem modificar configurações de logo" ON configuracoes_logo;

CREATE POLICY "Configurações de logo são visíveis para todos" ON configuracoes_logo
    FOR SELECT USING (true);

CREATE POLICY "Apenas gestores podem modificar configurações de logo" ON configuracoes_logo
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

-- 18. Criar políticas RLS para notificacoes
DROP POLICY IF EXISTS "Notificações ativas são visíveis para todos" ON notificacoes;
DROP POLICY IF EXISTS "Apenas gestores podem gerenciar notificações" ON notificacoes;

CREATE POLICY "Notificações ativas são visíveis para todos" ON notificacoes
    FOR SELECT USING (ativo = true);

CREATE POLICY "Apenas gestores podem gerenciar notificações" ON notificacoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

-- 19. Criar políticas RLS para usuarios_notificacoes
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON usuarios_notificacoes;
DROP POLICY IF EXISTS "Usuários podem marcar suas notificações como lidas" ON usuarios_notificacoes;
DROP POLICY IF EXISTS "Usuários podem atualizar suas notificações" ON usuarios_notificacoes;

CREATE POLICY "Usuários podem ver suas próprias notificações" ON usuarios_notificacoes
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem marcar suas notificações como lidas" ON usuarios_notificacoes
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas notificações" ON usuarios_notificacoes
    FOR UPDATE USING (usuario_id = auth.uid());

-- 20. Criar políticas RLS para dicas_estudo
DROP POLICY IF EXISTS "Dicas ativas são visíveis para todos" ON dicas_estudo;
DROP POLICY IF EXISTS "Apenas gestores podem gerenciar dicas" ON dicas_estudo;

CREATE POLICY "Dicas ativas são visíveis para todos" ON dicas_estudo
    FOR SELECT USING (ativo = true);

CREATE POLICY "Apenas gestores podem gerenciar dicas" ON dicas_estudo
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

-- 21. Criar bucket de storage via SQL (se suportado)
-- Nota: Buckets devem ser criados via interface do Supabase ou API REST
-- O bucket 'uploads' deve ser criado manualmente no painel do Supabase

-- 22. Configurar políticas de storage para o bucket 'uploads'
-- Estas políticas devem ser configuradas via interface do Supabase

-- Verificar se as funções foram criadas corretamente
SELECT 
    routine_name,
    routine_type,
    data_type
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
