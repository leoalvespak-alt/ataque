-- =====================================================
-- SCRIPT PARA VERIFICAR E CORRIGIR ESTRUTURA DA TABELA QUESTOES
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA QUESTOES
-- =====================================================

-- Verificar estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. VERIFICAR SE EXISTE COLUNA 'ano' DIRETA
-- =====================================================

-- Verificar se existe coluna 'ano' na tabela questoes
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'questoes' AND column_name = 'ano';

-- =====================================================
-- 3. VERIFICAR SE EXISTE COLUNA 'ano_id'
-- =====================================================

-- Verificar se existe coluna 'ano_id' na tabela questoes
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'questoes' AND column_name = 'ano_id';

-- =====================================================
-- 4. VERIFICAR DADOS EXISTENTES
-- =====================================================

-- Verificar se há questões na tabela
SELECT COUNT(*) as total_questoes FROM questoes;

-- Verificar estrutura de algumas questões
SELECT 
    id,
    enunciado,
    ano,
    disciplina_id,
    assunto_id,
    banca_id,
    orgao_id,
    ativo
FROM questoes 
LIMIT 5;

-- =====================================================
-- 5. VERIFICAR TABELA ANOS
-- =====================================================

-- Verificar se a tabela anos existe e tem dados
SELECT COUNT(*) as total_anos FROM anos;

-- Verificar dados da tabela anos
SELECT * FROM anos ORDER BY ano DESC LIMIT 10;

-- =====================================================
-- 6. VERIFICAR RELACIONAMENTOS
-- =====================================================

-- Verificar se as questões têm ano válidos
SELECT 
    q.id,
    q.ano,
    a.ano as ano_tabela_anos
FROM questoes q
LEFT JOIN anos a ON q.ano = a.ano
LIMIT 10;

-- =====================================================
-- 7. CORRIGIR ESTRUTURA SE NECESSÁRIO
-- =====================================================

-- Se não existir coluna 'ano' direta, adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questoes' AND column_name = 'ano'
    ) THEN
        -- Adicionar coluna ano
        ALTER TABLE questoes ADD COLUMN ano INTEGER;
        
        -- Se existir ano_id, migrar dados
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'questoes' AND column_name = 'ano_id'
        ) THEN
            -- Atualizar a coluna ano com os valores da tabela anos
            UPDATE questoes 
            SET ano = (
                SELECT a.ano 
                FROM anos a 
                WHERE a.id = questoes.ano_id
            );
        END IF;
        
        -- Tornar a coluna NOT NULL após preenchimento
        ALTER TABLE questoes ALTER COLUMN ano SET NOT NULL;
        
        RAISE NOTICE 'Coluna ano adicionada e preenchida com sucesso';
    ELSE
        RAISE NOTICE 'Coluna ano já existe';
    END IF;
END $$;

-- =====================================================
-- 8. VERIFICAR RESULTADO FINAL
-- =====================================================

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;

-- Verificar dados com ano
SELECT 
    id,
    enunciado,
    ano,
    disciplina_id,
    ativo
FROM questoes 
LIMIT 5;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de conclusão
SELECT 'Verificação da estrutura da tabela questoes concluída!' as status;
