-- Script para corrigir a coluna "ativo" na tabela dicas_estudo
-- Execute este SQL diretamente no painel do Supabase

-- 1. Verificar se a coluna "ativo" existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'dicas_estudo' 
        AND column_name = 'ativo'
    ) THEN
        -- Adicionar a coluna "ativo" se ela não existir
        ALTER TABLE dicas_estudo ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna "ativo" adicionada à tabela dicas_estudo';
    ELSE
        RAISE NOTICE 'Coluna "ativo" já existe na tabela dicas_estudo';
    END IF;
END $$;

-- 2. Atualizar registros existentes para ter ativo = true
UPDATE dicas_estudo SET ativo = TRUE WHERE ativo IS NULL;

-- 3. Verificar a estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dicas_estudo'
ORDER BY ordinal_position;

-- 4. Inserir dicas de estudo padrão (se não existirem)
INSERT INTO dicas_estudo (titulo, texto, categoria, prioridade, ativo) VALUES 
('Estude com Foco', 'Dedique 25 minutos de estudo focado, seguidos de 5 minutos de pausa. Esta técnica Pomodoro aumenta sua produtividade.', 'ESTUDO', 1, TRUE),
('Revise Regularmente', 'Faça revisões espaçadas do conteúdo. Revisar em intervalos crescentes (1 dia, 3 dias, 1 semana) melhora a retenção.', 'ESTUDO', 2, TRUE),
('Mantenha-se Motivado', 'Estabeleça metas pequenas e comemore cada conquista. O progresso constante é mais importante que a perfeição.', 'MOTIVACIONAL', 3, TRUE)
ON CONFLICT DO NOTHING;

-- 5. Verificar dados inseridos
SELECT 
    id,
    titulo,
    categoria,
    prioridade,
    ativo,
    created_at
FROM dicas_estudo
ORDER BY prioridade, id;
