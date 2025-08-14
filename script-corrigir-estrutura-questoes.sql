-- =====================================================
-- SCRIPT PARA CORRIGIR ESTRUTURA DA TABELA QUESTOES
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- =====================================================

-- Verificar estrutura atual da tabela questoes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. VERIFICAR SE EXISTE COLUNA 'ano'
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
-- 4. ADICIONAR COLUNA 'ano' SE NÃO EXISTIR
-- =====================================================

DO $$
BEGIN
    -- Verificar se a coluna 'ano' não existe
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
-- 5. VERIFICAR SE EXISTEM QUESTÕES CADASTRADAS
-- =====================================================

-- Verificar se há questões na tabela
SELECT COUNT(*) as total_questoes FROM questoes;

-- Verificar algumas questões para ver a estrutura
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
-- 6. INSERIR QUESTÕES DE EXEMPLO SE NÃO EXISTIREM
-- =====================================================

-- Verificar se existem disciplinas
SELECT COUNT(*) as total_disciplinas FROM disciplinas;

-- Verificar se existem assuntos
SELECT COUNT(*) as total_assuntos FROM assuntos;

-- Verificar se existem bancas
SELECT COUNT(*) as total_bancas FROM bancas;

-- Verificar se existem órgãos
SELECT COUNT(*) as total_orgaos FROM orgaos;

-- Inserir questões de exemplo se não existirem
INSERT INTO questoes (
    enunciado,
    alternativa_a,
    alternativa_b,
    alternativa_c,
    alternativa_d,
    alternativa_e,
    gabarito,
    ano,
    disciplina_id,
    assunto_id,
    banca_id,
    orgao_id,
    comentario_professor,
    ativo
) 
SELECT 
    'A Constituição Federal de 1988 estabelece que a República Federativa do Brasil é formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal. Assinale a alternativa que NÃO constitui um dos fundamentos da República Federativa do Brasil:',
    'A soberania',
    'A cidadania',
    'A dignidade da pessoa humana',
    'A monarquia parlamentar',
    'Os valores sociais do trabalho e da livre iniciativa',
    'D',
    2023,
    d.id,
    a.id,
    b.id,
    o.id,
    'A monarquia parlamentar não é um fundamento da República Federativa do Brasil. Os fundamentos estão previstos no art. 1º da CF/88: soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa e pluralismo político.',
    true
FROM disciplinas d
CROSS JOIN assuntos a
CROSS JOIN bancas b
CROSS JOIN orgaos o
WHERE d.nome = 'Direito Constitucional'
AND a.nome = 'Princípios Fundamentais'
AND b.nome = 'CESPE/CEBRASPE'
AND o.nome = 'União'
AND NOT EXISTS (
    SELECT 1 FROM questoes WHERE enunciado LIKE '%Constituição Federal de 1988%'
)
LIMIT 1;

-- Inserir segunda questão de exemplo
INSERT INTO questoes (
    enunciado,
    alternativa_a,
    alternativa_b,
    alternativa_c,
    alternativa_d,
    alternativa_e,
    gabarito,
    ano,
    disciplina_id,
    assunto_id,
    banca_id,
    orgao_id,
    comentario_professor,
    ativo
) 
SELECT 
    'Sobre o princípio da legalidade na Administração Pública, é correto afirmar que:',
    'A Administração pode agir livremente, desde que não viole direitos individuais.',
    'A Administração só pode fazer o que a lei expressamente autorizar.',
    'A Administração pode agir discricionariamente em todas as situações.',
    'A Administração está vinculada apenas aos princípios constitucionais.',
    'A Administração pode criar direitos e obrigações sem base legal.',
    'B',
    2022,
    d.id,
    a.id,
    b.id,
    o.id,
    'O princípio da legalidade estabelece que a Administração Pública só pode agir quando autorizada pela lei.',
    true
FROM disciplinas d
CROSS JOIN assuntos a
CROSS JOIN bancas b
CROSS JOIN orgaos o
WHERE d.nome = 'Direito Administrativo'
AND a.nome = 'Princípios da Administração Pública'
AND b.nome = 'FGV'
AND o.nome = 'TJ'
AND NOT EXISTS (
    SELECT 1 FROM questoes WHERE enunciado LIKE '%princípio da legalidade%'
)
LIMIT 1;

-- =====================================================
-- 7. VERIFICAR RESULTADO FINAL
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

-- Verificar questões criadas
SELECT 
    id,
    enunciado,
    ano,
    disciplina_id,
    ativo
FROM questoes 
ORDER BY id DESC
LIMIT 10;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de conclusão
SELECT 'Estrutura da tabela questoes corrigida com sucesso!' as status;
