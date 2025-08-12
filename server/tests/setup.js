// Configuração global para testes
const { sequelize } = require('../config/database');

// Configurar banco de dados de teste
beforeAll(async () => {
  // Usar banco de dados de teste se configurado
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync({ force: true });
  }
});

// Limpar banco após cada teste
afterEach(async () => {
  if (process.env.NODE_ENV === 'test') {
    // Limpar todas as tabelas
    await sequelize.truncate({ cascade: true });
  }
});

// Fechar conexão após todos os testes
afterAll(async () => {
  await sequelize.close();
});

// Configurar timeout global para testes
jest.setTimeout(10000);
