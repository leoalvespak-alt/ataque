require('dotenv').config();
const { sequelize } = require('./config/database');
const seedQuestoes = require('./seeds/questoes');
const seedAdmin = require('./seeds/admin');

async function seed() {
  try {
    // Sincronizar banco de dados
    console.log('\n🔄 Sincronizando banco de dados...');
    await sequelize.sync({ alter: true });
    console.log('✅ Sincronização concluída!\n');

    // Executar seeds
    console.log('🌱 Iniciando seed de dados...\n');
    
    await seedAdmin();
    await seedQuestoes();
    
    console.log('\n✅ Seed de dados concluído com sucesso!\n');
    
    // Fechar conexão
    await sequelize.close();
    
  } catch (error) {
    console.error('\n❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

// Executar seed
seed();