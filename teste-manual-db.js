// Caminho corrigido para o arquivo de conexão
const { sequelize } = require('./server/config/database.js');

async function testarConexao() {
  console.log('--- Iniciando teste de conexão definitivo ---');

  if (!sequelize) {
    console.error('[FALHA CRÍTICA] A variável sequelize não foi importada. Verifique o caminho no require().');
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('✅ [SUCESSO] Conexão com o banco de dados foi estabelecida com sucesso.');
  } catch (error) {
    console.error('❌ [FALHA] Não foi possível conectar ao banco de dados.');
    console.error('ERRO DETALHADO:', error);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
    console.log('--- Teste de conexão finalizado ---');
  }
}

testarConexao();