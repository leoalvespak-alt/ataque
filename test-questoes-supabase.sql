-- =====================================================
-- SCRIPT PARA TESTAR CONSULTA DE QUESTÕES NO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE EXISTEM QUESTÕES
-- =====================================================

-- Contar total de questões
SELECT COUNT(*) as total_questoes FROM questoes;

-- Verificar questões ativas
SELECT COUNT(*) as questoes_ativas FROM questoes WHERE ativo = true;

-- =====================================================
-- 2. VERIFICAR ESTRUTURA DE UMA QUESTÃO
-- =====================================================

-- Verificar estrutura de uma questão
SELECT 
    id,
    enunciado,
    alternativa_a,
    alternativa_b,
    alternativa_c,
    alternativa_d,
    alternativa_e,
    gabarito,
    ano,
    ano_id,
    disciplina_id,
    assunto_id,
    banca_id,
    orgao_id,
    ativo,
    created_at
FROM questoes 
LIMIT 1;

-- =====================================================
-- 3. TESTAR CONSULTA COMPLETA (igual ao frontend)
-- =====================================================

-- Testar a consulta que o frontend está fazendo
SELECT 
    q.*,
    d.nome as disciplina_nome,
    a.nome as assunto_nome,
    b.nome as banca_nome,
    o.nome as orgao_nome,
    an.ano as ano_valor
FROM questoes q
INNER JOIN disciplinas d ON q.disciplina_id = d.id
INNER JOIN assuntos a ON q.assunto_id = a.id
INNER JOIN bancas b ON q.banca_id = b.id
INNER JOIN orgaos o ON q.orgao_id = o.id
INNER JOIN anos an ON q.ano_id = an.id
WHERE q.ativo = true
ORDER BY q.created_at DESC
LIMIT 5;

-- =====================================================
-- 4. VERIFICAR TABELAS RELACIONADAS
-- =====================================================

-- Verificar disciplinas
SELECT COUNT(*) as total_disciplinas FROM disciplinas;
SELECT * FROM disciplinas LIMIT 5;

-- Verificar assuntos
SELECT COUNT(*) as total_assuntos FROM assuntos;
SELECT * FROM assuntos LIMIT 5;

-- Verificar bancas
SELECT COUNT(*) as total_bancas FROM bancas;
SELECT * FROM bancas LIMIT 5;

-- Verificar órgãos
SELECT COUNT(*) as total_orgaos FROM orgaos;
SELECT * FROM orgaos LIMIT 5;

-- Verificar anos
SELECT COUNT(*) as total_anos FROM anos;
SELECT * FROM anos ORDER BY ano DESC LIMIT 5;

-- =====================================================
-- 5. VERIFICAR RELACIONAMENTOS
-- =====================================================

-- Verificar se as questões têm relacionamentos válidos
SELECT 
    COUNT(*) as questoes_com_relacionamentos_validos
FROM questoes q
INNER JOIN disciplinas d ON q.disciplina_id = d.id
INNER JOIN assuntos a ON q.assunto_id = a.id
INNER JOIN bancas b ON q.banca_id = b.id
INNER JOIN orgaos o ON q.orgao_id = o.id
INNER JOIN anos an ON q.ano_id = an.id
WHERE q.ativo = true;

-- =====================================================
-- 6. INSERIR QUESTÃO DE TESTE SE NÃO EXISTIR
-- =====================================================

-- Verificar se há questões antes de inserir
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM questoes) = 0 THEN
        -- Inserir questão de teste
        INSERT INTO questoes (
            enunciado,
            alternativa_a,
            alternativa_b,
            alternativa_c,
            alternativa_d,
            alternativa_e,
            gabarito,
            ano,
            ano_id,
            disciplina_id,
            assunto_id,
            banca_id,
            orgao_id,
            ativo
        ) VALUES (
            'Questão de teste para verificar funcionamento da plataforma. Qual é a capital do Brasil?',
            'São Paulo',
            'Rio de Janeiro',
            'Brasília',
            'Salvador',
            'Belo Horizonte',
            'C',
            2024,
            (SELECT id FROM anos WHERE ano = 2024 LIMIT 1),
            (SELECT id FROM disciplinas LIMIT 1),
            (SELECT id FROM assuntos LIMIT 1),
            (SELECT id FROM bancas LIMIT 1),
            (SELECT id FROM orgaos LIMIT 1),
            true
        );
        
        RAISE NOTICE 'Questão de teste inserida com sucesso';
    ELSE
        RAISE NOTICE 'Já existem questões no banco de dados';
    END IF;
END $$;

-- =====================================================
-- 7. VERIFICAR RESULTADO FINAL
-- =====================================================

-- Verificar questões após possível inserção
SELECT 
    COUNT(*) as total_questoes_final,
    COUNT(CASE WHEN ativo = true THEN 1 END) as questoes_ativas_final
FROM questoes;

-- Mostrar algumas questões para verificação
SELECT 
    id,
    enunciado,
    ano,
    disciplina_id,
    ativo
FROM questoes 
ORDER BY created_at DESC 
LIMIT 3;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de conclusão
SELECT 'Teste de questões no Supabase concluído!' as status;
