const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api';

async function testMinimalServer() {
  console.log('🚀 Testando servidor minimalista...\n');

  try {
    // Testar health check
    console.log('1. Testando health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check OK:', health.data.message);

    // Testar rota de teste
    console.log('\n2. Testando rota de teste...');
    const test = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Teste OK:', test.data.message);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testMinimalServer();
