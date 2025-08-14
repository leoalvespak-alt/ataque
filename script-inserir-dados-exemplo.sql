-- =====================================================
-- SCRIPT PARA INSERIR DADOS DE EXEMPLO NO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. INSERIR DISCIPLINAS
-- =====================================================

INSERT INTO disciplinas (nome) VALUES
('Direito Constitucional'),
('Direito Administrativo'),
('Português'),
('Matemática'),
('Informática')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 2. INSERIR ASSUNTOS
-- =====================================================

INSERT INTO assuntos (nome, disciplina_id) VALUES
('Princípios Fundamentais', (SELECT id FROM disciplinas WHERE nome = 'Direito Constitucional')),
('Direitos e Garantias', (SELECT id FROM disciplinas WHERE nome = 'Direito Constitucional')),
('Princípios da Administração', (SELECT id FROM disciplinas WHERE nome = 'Direito Administrativo')),
('Atos Administrativos', (SELECT id FROM disciplinas WHERE nome = 'Direito Administrativo')),
('Gramática', (SELECT id FROM disciplinas WHERE nome = 'Português')),
('Interpretação de Texto', (SELECT id FROM disciplinas WHERE nome = 'Português')),
('Álgebra', (SELECT id FROM disciplinas WHERE nome = 'Matemática')),
('Geometria', (SELECT id FROM disciplinas WHERE nome = 'Matemática')),
('Sistemas Operacionais', (SELECT id FROM disciplinas WHERE nome = 'Informática')),
('Redes de Computadores', (SELECT id FROM disciplinas WHERE nome = 'Informática'))
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 3. INSERIR BANCAS
-- =====================================================

INSERT INTO bancas (nome) VALUES
('CESPE/CEBRASPE'),
('FGV'),
('VUNESP'),
('FEPESE'),
('IADES')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 4. INSERIR ÓRGÃOS
-- =====================================================

INSERT INTO orgaos (nome) VALUES
('União'),
('Tribunal de Justiça'),
('Ministério Público'),
('Polícia Federal'),
('Receita Federal')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 5. INSERIR ANOS
-- =====================================================

INSERT INTO anos (ano) VALUES
(2024),
(2023),
(2022),
(2021),
(2020),
(2019),
(2018),
(2017),
(2016),
(2015)
ON CONFLICT (ano) DO NOTHING;

-- =====================================================
-- 6. INSERIR QUESTÕES DE EXEMPLO
-- =====================================================

-- Questão 1: Direito Constitucional
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
    'A Constituição Federal de 1988 estabelece que a República Federativa do Brasil é formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal. Assinale a alternativa que NÃO constitui um dos fundamentos da República Federativa do Brasil:',
    'A soberania',
    'A cidadania',
    'A dignidade da pessoa humana',
    'A monarquia parlamentar',
    'Os valores sociais do trabalho e da livre iniciativa',
    'D',
    2024,
    (SELECT id FROM anos WHERE ano = 2024),
    (SELECT id FROM disciplinas WHERE nome = 'Direito Constitucional'),
    (SELECT id FROM assuntos WHERE nome = 'Princípios Fundamentais'),
    (SELECT id FROM bancas WHERE nome = 'CESPE/CEBRASPE'),
    (SELECT id FROM orgaos WHERE nome = 'União'),
    true
) ON CONFLICT DO NOTHING;

-- Questão 2: Direito Administrativo
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
    'Sobre os princípios da Administração Pública, assinale a alternativa correta:',
    'A eficiência não é um princípio constitucional da Administração Pública',
    'A moralidade administrativa não se confunde com a moralidade comum',
    'A publicidade não é obrigatória para todos os atos administrativos',
    'A impessoalidade não se aplica aos atos discricionários',
    'A legalidade não é o princípio fundamental da Administração Pública',
    'B',
    2023,
    (SELECT id FROM anos WHERE ano = 2023),
    (SELECT id FROM disciplinas WHERE nome = 'Direito Administrativo'),
    (SELECT id FROM assuntos WHERE nome = 'Princípios da Administração'),
    (SELECT id FROM bancas WHERE nome = 'FGV'),
    (SELECT id FROM orgaos WHERE nome = 'Tribunal de Justiça'),
    true
) ON CONFLICT DO NOTHING;

-- Questão 3: Português
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
    'Assinale a alternativa em que a concordância verbal está correta:',
    'Fazem dois anos que não o vejo',
    'Haviam muitas pessoas na reunião',
    'Devem existir várias soluções para o problema',
    'Faltam cinco minutos para o início da palestra',
    'Sobram poucos recursos para o projeto',
    'D',
    2022,
    (SELECT id FROM anos WHERE ano = 2022),
    (SELECT id FROM disciplinas WHERE nome = 'Português'),
    (SELECT id FROM assuntos WHERE nome = 'Gramática'),
    (SELECT id FROM bancas WHERE nome = 'VUNESP'),
    (SELECT id FROM orgaos WHERE nome = 'Ministério Público'),
    true
) ON CONFLICT DO NOTHING;

-- Questão 4: Matemática
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
    'Qual é o valor de x na equação 2x + 5 = 13?',
    'x = 3',
    'x = 4',
    'x = 5',
    'x = 6',
    'x = 7',
    'B',
    2021,
    (SELECT id FROM anos WHERE ano = 2021),
    (SELECT id FROM disciplinas WHERE nome = 'Matemática'),
    (SELECT id FROM assuntos WHERE nome = 'Álgebra'),
    (SELECT id FROM bancas WHERE nome = 'FEPESE'),
    (SELECT id FROM orgaos WHERE nome = 'Polícia Federal'),
    true
) ON CONFLICT DO NOTHING;

-- Questão 5: Informática
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
    'Qual é o sistema operacional mais utilizado em servidores web?',
    'Windows Server',
    'Linux',
    'macOS Server',
    'FreeBSD',
    'Solaris',
    'B',
    2020,
    (SELECT id FROM anos WHERE ano = 2020),
    (SELECT id FROM disciplinas WHERE nome = 'Informática'),
    (SELECT id FROM assuntos WHERE nome = 'Sistemas Operacionais'),
    (SELECT id FROM bancas WHERE nome = 'IADES'),
    (SELECT id FROM orgaos WHERE nome = 'Receita Federal'),
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. VERIFICAR DADOS INSERIDOS
-- =====================================================

-- Verificar total de questões
SELECT COUNT(*) as total_questoes FROM questoes;

-- Verificar questões por disciplina
SELECT 
    d.nome as disciplina,
    COUNT(q.id) as total_questoes
FROM disciplinas d
LEFT JOIN questoes q ON d.id = q.disciplina_id
GROUP BY d.id, d.nome
ORDER BY total_questoes DESC;

-- Verificar questões por ano
SELECT 
    a.ano,
    COUNT(q.id) as total_questoes
FROM anos a
LEFT JOIN questoes q ON a.id = q.ano_id
GROUP BY a.id, a.ano
ORDER BY a.ano DESC;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de conclusão
SELECT 'Dados de exemplo inseridos com sucesso!' as status;
