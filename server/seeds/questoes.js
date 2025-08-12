const { Questao, Disciplina, Assunto, Banca, Orgao } = require('../models');

async function seedQuestoes() {
  try {
    // Buscar IDs existentes
    const disciplinas = await Disciplina.findAll();
    const assuntos = await Assunto.findAll();
    const bancas = await Banca.findAll();
    const orgaos = await Orgao.findAll();

    if (!disciplinas.length || !assuntos.length || !bancas.length || !orgaos.length) {
      throw new Error('Dados base (disciplinas, assuntos, bancas, órgãos) não encontrados');
    }

    // Criar questões de exemplo
    const questoes = [
      {
        enunciado: 'De acordo com a Constituição Federal de 1988, a República Federativa do Brasil tem como fundamentos, EXCETO:',
        alternativa_a: 'A soberania',
        alternativa_b: 'A cidadania',
        alternativa_c: 'O pluralismo político',
        alternativa_d: 'A intervenção estatal na economia',
        alternativa_e: 'Os valores sociais do trabalho e da livre iniciativa',
        gabarito: 'D',
        comentario_professor: 'A intervenção estatal na economia não é um fundamento da República, mas sim um princípio da ordem econômica.',
        ano: 2023,
        disciplina_id: disciplinas[0].id, // Direito Constitucional
        assunto_id: assuntos[0].id, // Princípios Fundamentais
        banca_id: bancas[0].id, // CESPE
        orgao_id: orgaos[0].id // TJ
      },
      {
        enunciado: 'Sobre o uso do "porque", "por que", "porquê" e "por quê", assinale a alternativa correta:',
        alternativa_a: '"Porque" é usado em respostas e "por que" em perguntas',
        alternativa_b: '"Por que" junto é usado em final de frase',
        alternativa_c: '"Porquê" é usado como substantivo',
        alternativa_d: '"Por quê" é usado no início de frases',
        alternativa_e: 'Todas as formas têm o mesmo uso',
        gabarito: 'C',
        comentario_professor: 'O "porquê" (junto e com acento) é usado como substantivo, como em "Quero saber o porquê dessa decisão".',
        ano: 2023,
        disciplina_id: disciplinas[1].id, // Português
        assunto_id: assuntos[1].id, // Ortografia
        banca_id: bancas[1].id, // FGV
        orgao_id: orgaos[1].id // TCU
      },
      {
        enunciado: 'Em um concurso público com 1000 candidatos, 40% foram aprovados. Destes, 3/4 são mulheres. Quantos homens foram aprovados?',
        alternativa_a: '100 homens',
        alternativa_b: '150 homens',
        alternativa_c: '200 homens',
        alternativa_d: '250 homens',
        alternativa_e: '300 homens',
        gabarito: 'A',
        comentario_professor: '40% de 1000 = 400 aprovados\n3/4 de 400 = 300 mulheres\nLogo, 100 homens foram aprovados',
        ano: 2023,
        disciplina_id: disciplinas[2].id, // Matemática
        assunto_id: assuntos[2].id, // Porcentagem
        banca_id: bancas[2].id, // VUNESP
        orgao_id: orgaos[2].id // PM
      },
      {
        enunciado: 'Qual é o prazo para a Administração Pública anular os atos administrativos de que decorram efeitos favoráveis para os destinatários?',
        alternativa_a: '3 anos',
        alternativa_b: '4 anos',
        alternativa_c: '5 anos',
        alternativa_d: '10 anos',
        alternativa_e: 'Não há prazo',
        gabarito: 'C',
        comentario_professor: 'De acordo com a Lei 9.784/99, art. 54, o prazo decadencial é de 5 anos, contados da data em que foram praticados.',
        ano: 2023,
        disciplina_id: disciplinas[3].id, // Direito Administrativo
        assunto_id: assuntos[3].id, // Atos Administrativos
        banca_id: bancas[0].id, // CESPE
        orgao_id: orgaos[3].id // PF
      },
      {
        enunciado: 'No ciclo orçamentário, o Plano Plurianual (PPA) tem vigência de:',
        alternativa_a: '2 anos',
        alternativa_b: '3 anos',
        alternativa_c: '4 anos',
        alternativa_d: '5 anos',
        alternativa_e: '6 anos',
        gabarito: 'C',
        comentario_professor: 'O PPA tem vigência de 4 anos, iniciando no segundo ano do mandato do chefe do Executivo e terminando no primeiro ano do mandato subsequente.',
        ano: 2023,
        disciplina_id: disciplinas[4].id, // AFO
        assunto_id: assuntos[4].id, // Ciclo Orçamentário
        banca_id: bancas[1].id, // FGV
        orgao_id: orgaos[4].id // TCE
      }
    ];

    // Inserir questões
    await Questao.bulkCreate(questoes);
    console.log('✅ Questões de exemplo criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar questões de exemplo:', error);
    throw error;
  }
}

module.exports = seedQuestoes;
