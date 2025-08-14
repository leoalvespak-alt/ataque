-- Script para corrigir colunas nas tabelas notificacoes e dicas_estudo
-- Execute este SQL diretamente no painel do Supabase

-- 1. Verificar estrutura atual das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('notificacoes', 'dicas_estudo')
ORDER BY table_name, ordinal_position;

-- 2. Corrigir tabela notificacoes
DO $$
BEGIN
    -- Verificar se a coluna 'ativo' existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notificacoes' 
        AND column_name = 'ativo'
    ) THEN
        -- Adicionar coluna 'ativo' se não existir
        ALTER TABLE notificacoes ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna "ativo" adicionada à tabela notificacoes';
        
        -- Se existir coluna 'ativa', copiar dados e remover
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'notificacoes' 
            AND column_name = 'ativa'
        ) THEN
            UPDATE notificacoes SET ativo = ativa WHERE ativo IS NULL;
            ALTER TABLE notificacoes DROP COLUMN ativa;
            RAISE NOTICE 'Coluna "ativa" removida da tabela notificacoes';
        END IF;
    ELSE
        RAISE NOTICE 'Coluna "ativo" já existe na tabela notificacoes';
    END IF;
END $$;

-- 3. Corrigir tabela dicas_estudo
DO $$
BEGIN
    -- Verificar se a coluna 'ativo' existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'dicas_estudo' 
        AND column_name = 'ativo'
    ) THEN
        -- Adicionar a coluna 'ativo' se ela não existir
        ALTER TABLE dicas_estudo ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna "ativo" adicionada à tabela dicas_estudo';
    ELSE
        RAISE NOTICE 'Coluna "ativo" já existe na tabela dicas_estudo';
    END IF;
END $$;

-- 4. Atualizar registros existentes
UPDATE notificacoes SET ativo = TRUE WHERE ativo IS NULL;
UPDATE dicas_estudo SET ativo = TRUE WHERE ativo IS NULL;

-- 5. Verificar estrutura corrigida
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('notificacoes', 'dicas_estudo')
ORDER BY table_name, ordinal_position;

-- 6. Inserir dados padrão se não existirem
INSERT INTO notificacoes (titulo, mensagem, tipo, prioridade, ativo) VALUES 
('Bem-vindo!', 'Bem-vindo à plataforma de estudos. Comece explorando as questões disponíveis.', 'GERAL', 'NORMAL', TRUE),
('Dica de Estudo', 'Estude regularmente para melhorar seu desempenho.', 'DICA', 'NORMAL', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO dicas_estudo (titulo, texto, categoria, prioridade, ativo) VALUES 
('Estude com Foco', 'Dedique 25 minutos de estudo focado, seguidos de 5 minutos de pausa. Esta técnica Pomodoro aumenta sua produtividade.', 'ESTUDO', 1, TRUE),
('Revise Regularmente', 'Faça revisões espaçadas do conteúdo. Revisar em intervalos crescentes (1 dia, 3 dias, 1 semana) melhora a retenção.', 'ESTUDO', 2, TRUE),
('Mantenha-se Motivado', 'Estabeleça metas pequenas e comemore cada conquista. O progresso constante é mais importante que a perfeição.', 'MOTIVACIONAL', 3, TRUE)
ON CONFLICT DO NOTHING;

-- 7. Verificar dados inseridos
SELECT 'notificacoes' as tabela, COUNT(*) as total FROM notificacoes WHERE ativo = TRUE
UNION ALL
SELECT 'dicas_estudo' as tabela, COUNT(*) as total FROM dicas_estudo WHERE ativo = TRUE;
