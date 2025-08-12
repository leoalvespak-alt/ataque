require('dotenv').config();
const { sequelize } = require('./config/database');
const { User, Disciplina, Assunto, Banca, Orgao, Questao, RespostaUsuario, ComentarioAluno, AvaliacaoQuestao, PlanoAssinatura, AssinaturaUsuario, ConfiguracaoPlataforma } = require('./models');
const seedAdmin = require('./seeds/admin');
const seedCategorias = require('./seeds/categorias');
const seedUsuarios = require('./seeds/usuarios');
const seedQuestoes = require('./seeds/questoes');

async function setupDatabase() {
  try {
    console.log('🔄 Iniciando configuração do banco de dados...');
    
    // Sincronizar modelos com o banco
    console.log('📊 Sincronizando modelos...');
    await sequelize.sync({ force: true });
    console.log('✅ Modelos sincronizados com sucesso!');
    
    // Executar seeds
    console.log('🌱 Executando seeds...');
    await seedCategorias();
    await seedAdmin();
    await seedUsuarios();
    await seedQuestoes();
    console.log('✅ Seeds executados com sucesso!');
    
    console.log('🎉 Banco de dados configurado com sucesso!');
    console.log('📝 Credenciais padrão:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Aluno: aluno@example.com / aluno123');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
