const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

async function testRoutes() {
  console.log('🚀 Testando rotas da API...\n');

  try {
    // Testar health check
    console.log('1. Testando health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check OK:', health.data.message);

    // Testar categorias
    console.log('\n2. Testando categorias...');
    const categorias = await axios.get(`${BASE_URL}/categories/todas`);
    console.log('✅ Categorias OK:', categorias.data);

    // Testar disciplinas
    console.log('\n3. Testando disciplinas...');
    const disciplinas = await axios.get(`${BASE_URL}/categories/disciplinas`);
    console.log('✅ Disciplinas OK:', disciplinas.data);

    // Testar questões
    console.log('\n4. Testando questões...');
    const questoes = await axios.get(`${BASE_URL}/questions`);
    console.log('✅ Questões OK:', questoes.data);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testRoutes();
