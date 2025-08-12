const { Disciplina, Assunto, Banca, Orgao } = require('../models');

async function seedCategorias() {
  try {
    console.log('🌱 Criando categorias base...');

    // Criar disciplinas
    const disciplinas = await Disciplina.bulkCreate([
      { nome: 'Direito Constitucional', ativo: true },
      { nome: 'Português', ativo: true },
      { nome: 'Matemática', ativo: true },
      { nome: 'Direito Administrativo', ativo: true },
      { nome: 'Administração Financeira e Orçamentária', ativo: true },
      { nome: 'Direito Civil', ativo: true },
      { nome: 'Direito Penal', ativo: true },
      { nome: 'Direito Processual Civil', ativo: true },
      { nome: 'Direito Processual Penal', ativo: true },
      { nome: 'Informática', ativo: true },
      { nome: 'Raciocínio Lógico', ativo: true },
      { nome: 'Atualidades', ativo: true }
    ]);
    console.log('✅ Disciplinas criadas:', disciplinas.length);

    // Criar assuntos
    const assuntos = await Assunto.bulkCreate([
      { nome: 'Princípios Fundamentais', disciplina_id: disciplinas[0].id, ativo: true },
      { nome: 'Direitos e Garantias Fundamentais', disciplina_id: disciplinas[0].id, ativo: true },
      { nome: 'Organização do Estado', disciplina_id: disciplinas[0].id, ativo: true },
      { nome: 'Ortografia', disciplina_id: disciplinas[1].id, ativo: true },
      { nome: 'Gramática', disciplina_id: disciplinas[1].id, ativo: true },
      { nome: 'Interpretação de Texto', disciplina_id: disciplinas[1].id, ativo: true },
      { nome: 'Porcentagem', disciplina_id: disciplinas[2].id, ativo: true },
      { nome: 'Regra de Três', disciplina_id: disciplinas[2].id, ativo: true },
      { nome: 'Geometria', disciplina_id: disciplinas[2].id, ativo: true },
      { nome: 'Atos Administrativos', disciplina_id: disciplinas[3].id, ativo: true },
      { nome: 'Princípios da Administração Pública', disciplina_id: disciplinas[3].id, ativo: true },
      { nome: 'Ciclo Orçamentário', disciplina_id: disciplinas[4].id, ativo: true },
      { nome: 'Lei de Responsabilidade Fiscal', disciplina_id: disciplinas[4].id, ativo: true }
    ]);
    console.log('✅ Assuntos criados:', assuntos.length);

    // Criar bancas
    const bancas = await Banca.bulkCreate([
      { nome: 'CESPE/CEBRASPE', ativo: true },
      { nome: 'FGV', ativo: true },
      { nome: 'VUNESP', ativo: true },
      { nome: 'FEPESE', ativo: true },
      { nome: 'IADES', ativo: true },
      { nome: 'FUNDEP', ativo: true },
      { nome: 'FUNDAÇÃO CESGRANRIO', ativo: true },
      { nome: 'INSTITUTO AOCP', ativo: true },
      { nome: 'QUADRIX', ativo: true },
      { nome: 'FUNDAÇÃO VUNESP', ativo: true }
    ]);
    console.log('✅ Bancas criadas:', bancas.length);

    // Criar órgãos
    const orgaos = await Orgao.bulkCreate([
      { nome: 'Tribunal de Justiça (TJ)', ativo: true },
      { nome: 'Tribunal de Contas da União (TCU)', ativo: true },
      { nome: 'Polícia Militar (PM)', ativo: true },
      { nome: 'Polícia Federal (PF)', ativo: true },
      { nome: 'Tribunal de Contas Estadual (TCE)', ativo: true },
      { nome: 'Ministério Público (MP)', ativo: true },
      { nome: 'Defensoria Pública', ativo: true },
      { nome: 'Receita Federal', ativo: true },
      { nome: 'Banco Central', ativo: true },
      { nome: 'Câmara dos Deputados', ativo: true },
      { nome: 'Senado Federal', ativo: true },
      { nome: 'Tribunal Superior do Trabalho (TST)', ativo: true },
      { nome: 'Tribunal Superior Eleitoral (TSE)', ativo: true }
    ]);
    console.log('✅ Órgãos criados:', orgaos.length);

    console.log('🎉 Categorias base criadas com sucesso!');
    return { disciplinas, assuntos, bancas, orgaos };

  } catch (error) {
    console.error('❌ Erro ao criar categorias base:', error);
    throw error;
  }
}

module.exports = seedCategorias;
