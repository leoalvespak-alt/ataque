require('dotenv').config();
const { sequelize } = require('./config/database');

async function syncDatabase() {
  try {
    console.log('🔄 Iniciando sincronização do banco de dados...');
    
    // Sincronizar todas as tabelas
    await sequelize.sync({ alter: true });
    
    console.log('✅ Banco de dados sincronizado com sucesso!');
    console.log('📊 Todas as tabelas foram criadas/atualizadas');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error);
    process.exit(1);
  }
}

syncDatabase();


