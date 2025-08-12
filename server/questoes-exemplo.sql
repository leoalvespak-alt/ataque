-- Questões de exemplo para teste da plataforma
-- Execute este arquivo após o seed para adicionar questões de teste

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
  disciplina_id, 
  assunto_id, 
  banca_id, 
  orgao_id, 
  comentario_professor,
  ativo
) VALUES (
  'A Constituição Federal de 1988 estabelece que a República Federativa do Brasil é formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal. Assinale a alternativa que NÃO constitui um dos fundamentos da República Federativa do Brasil:',
  'A soberania',
  'A cidadania',
  'A dignidade da pessoa humana',
  'A monarquia parlamentar',
  'Os valores sociais do trabalho e da livre iniciativa',
  'D',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Direito Constitucional' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Princípios Fundamentais' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Direito Constitucional' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'CESPE/CEBRASPE' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'União' LIMIT 1),
  'A monarquia parlamentar não é um fundamento da República Federativa do Brasil. Os fundamentos estão previstos no art. 1º da CF/88: soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa e pluralismo político.',
  1
);

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
  disciplina_id, 
  assunto_id, 
  banca_id, 
  orgao_id, 
  comentario_professor,
  ativo
) VALUES (
  'Os princípios da Administração Pública estão expressamente previstos na Constituição Federal. Assinale a alternativa que apresenta corretamente os princípios constitucionais da Administração Pública:',
  'Legalidade, impessoalidade, moralidade, publicidade e eficiência',
  'Legalidade, pessoalidade, moralidade, publicidade e eficiência',
  'Legalidade, impessoalidade, imoralidade, publicidade e eficiência',
  'Legalidade, impessoalidade, moralidade, sigilo e eficiência',
  'Ilegalidade, impessoalidade, moralidade, publicidade e eficiência',
  'A',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Direito Administrativo' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Princípios da Administração Pública' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Direito Administrativo' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'FGV' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'União' LIMIT 1),
  'Os princípios da Administração Pública estão previstos no art. 37, caput, da CF/88: legalidade, impessoalidade, moralidade, publicidade e eficiência. Estes princípios são obrigatórios para toda a Administração Pública.',
  1
);

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
  disciplina_id, 
  assunto_id, 
  banca_id, 
  orgao_id, 
  comentario_professor,
  ativo
) VALUES (
  'Assinale a alternativa em que todas as palavras estão grafadas corretamente:',
  'Exceção, excesso, exceção, excessão',
  'Exceção, excesso, exceção, exceção',
  'Excessão, excesso, exceção, exceção',
  'Exceção, excessão, exceção, exceção',
  'Excessão, excessão, excessão, excessão',
  'B',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Português' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Ortografia' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Português' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'VUNESP' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'Estados' LIMIT 1),
  'A grafia correta é "exceção" (com "ç") e "excesso" (com "ss"). A palavra "exceção" vem do latim "exceptio" e "excesso" vem do latim "excessus".',
  1
);

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
  disciplina_id, 
  assunto_id, 
  banca_id, 
  orgao_id, 
  comentario_professor,
  ativo
) VALUES (
  'Em uma progressão aritmética, o primeiro termo é 5 e a razão é 3. Qual é o décimo termo dessa progressão?',
  '32',
  '35',
  '38',
  '41',
  '44',
  'A',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Matemática' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Progressões' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Matemática' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'CESPE/CEBRASPE' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'União' LIMIT 1),
  'Na PA, an = a1 + (n-1)r. Para n=10: a10 = 5 + (10-1)3 = 5 + 27 = 32.',
  1
);

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
  disciplina_id, 
  assunto_id, 
  banca_id, 
  orgao_id, 
  comentario_professor,
  ativo
) VALUES (
  'Qual protocolo é utilizado para transferência segura de dados na web?',
  'HTTP',
  'HTTPS',
  'FTP',
  'SMTP',
  'POP3',
  'B',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Informática' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Redes e Internet' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Informática' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'FGV' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'União' LIMIT 1),
  'HTTPS (HTTP Secure) é o protocolo que utiliza criptografia SSL/TLS para transferir dados de forma segura na web.',
  1
);

-- Questão 6: Direito Civil
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
) VALUES (
  'A capacidade civil de direito é:',
  'Adquirida aos 18 anos',
  'Adquirida aos 16 anos',
  'Adquirida desde o nascimento com vida',
  'Adquirida aos 21 anos',
  'Adquirida aos 14 anos',
  'C',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Direito Civil' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Pessoas Naturais' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Direito Civil' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'CESPE/CEBRASPE' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'União' LIMIT 1),
  'A capacidade civil de direito (capacidade de gozo) é adquirida desde o nascimento com vida, conforme art. 2º do Código Civil.',
  1
);

-- Questão 7: Direito Penal
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
) VALUES (
  'O princípio da legalidade penal está previsto na Constituição Federal e no Código Penal. Assinale a alternativa correta:',
  'Não há crime sem lei anterior que o defina',
  'Não há crime sem processo anterior que o defina',
  'Não há crime sem sentença anterior que o defina',
  'Não há crime sem denúncia anterior que o defina',
  'Não há crime sem investigação anterior que o defina',
  'A',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Direito Penal' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Princípios do Direito Penal' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Direito Penal' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'FGV' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'União' LIMIT 1),
  'O princípio da legalidade está previsto no art. 5º, XXXIX, da CF/88: "não há crime sem lei anterior que o defina, nem pena sem prévia cominação legal".',
  1
);

-- Questão 8: Direito do Trabalho
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
) VALUES (
  'Qual é o prazo prescricional para o empregado pleitear verbas trabalhistas?',
  '2 anos',
  '3 anos',
  '5 anos',
  '10 anos',
  '20 anos',
  'A',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Direito do Trabalho' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Prescrição' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Direito do Trabalho' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'CESPE/CEBRASPE' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'União' LIMIT 1),
  'O prazo prescricional para pleitear verbas trabalhistas é de 2 anos, conforme art. 7º, XXIX, da CF/88.',
  1
);

-- Questão 9: Administração Pública
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
) VALUES (
  'O processo administrativo federal está disciplinado pela Lei nº 9.784/1999. Assinale a alternativa que apresenta corretamente um dos princípios do processo administrativo:',
  'Princípio da oficialidade',
  'Princípio da discricionariedade',
  'Princípio da arbitrariedade',
  'Princípio da parcialidade',
  'Princípio da informalidade',
  'A',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Administração Pública' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Processo Administrativo' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Administração Pública' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'FGV' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'União' LIMIT 1),
  'O princípio da oficialidade está previsto no art. 2º, I, da Lei 9.784/1999, segundo o qual a Administração deve iniciar o processo de ofício quando for obrigatória a sua instauração.',
  1
);

-- Questão 10: Contabilidade
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
) VALUES (
  'Qual é o princípio contábil que determina que os efeitos das transações devem ser reconhecidos no período em que ocorrem?',
  'Princípio da Competência',
  'Princípio da Entidade',
  'Princípio da Continuidade',
  'Princípio da Oportunidade',
  'Princípio da Prudência',
  'A',
  2023,
  (SELECT id FROM disciplinas WHERE nome = 'Contabilidade' LIMIT 1),
  (SELECT id FROM assuntos WHERE nome = 'Princípios Contábeis' AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Contabilidade' LIMIT 1) LIMIT 1),
  (SELECT id FROM bancas WHERE nome = 'CESPE/CEBRASPE' LIMIT 1),
  (SELECT id FROM orgaos WHERE nome = 'União' LIMIT 1),
  'O Princípio da Competência determina que os efeitos das transações devem ser reconhecidos no período em que ocorrem, independentemente do recebimento ou pagamento.',
  1
);

-- Adicionar mais assuntos se necessário
INSERT IGNORE INTO assuntos (nome, disciplina_id, ativo) VALUES
('Ortografia', (SELECT id FROM disciplinas WHERE nome = 'Português' LIMIT 1), 1),
('Progressões', (SELECT id FROM disciplinas WHERE nome = 'Matemática' LIMIT 1), 1),
('Redes e Internet', (SELECT id FROM disciplinas WHERE nome = 'Informática' LIMIT 1), 1),
('Pessoas Naturais', (SELECT id FROM disciplinas WHERE nome = 'Direito Civil' LIMIT 1), 1),
('Princípios do Direito Penal', (SELECT id FROM disciplinas WHERE nome = 'Direito Penal' LIMIT 1), 1),
('Prescrição', (SELECT id FROM disciplinas WHERE nome = 'Direito do Trabalho' LIMIT 1), 1),
('Processo Administrativo', (SELECT id FROM disciplinas WHERE nome = 'Administração Pública' LIMIT 1), 1),
('Princípios Contábeis', (SELECT id FROM disciplinas WHERE nome = 'Contabilidade' LIMIT 1), 1);

COMMIT;
