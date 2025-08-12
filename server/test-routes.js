const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';
let authToken = null;

// Função para fazer login e obter token
async function login() {
  try {
    console.log('🔐 Fazendo login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      senha: 'admin123'
    });
    
    authToken = response.data.token;
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    return false;
  }
}

// Função para testar uma rota
async function testRoute(method, endpoint, data = null, description = '') {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    console.log(`✅ ${description || `${method} ${endpoint}`} - Status: ${response.status}`);
    return true;
  } catch (error) {
    console.error(`❌ ${description || `${method} ${endpoint}`} - Erro: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Função principal de teste
async function testAllRoutes() {
  console.log('🚀 Iniciando testes das rotas da API...\n');

  // Testar login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Falha no login, abortando testes');
    return;
  }

  console.log('\n📋 Testando rotas públicas...');
  
  // Rotas públicas
  await testRoute('GET', '/health', null, 'Health Check');
  await testRoute('GET', '/categories/todas', null, 'Buscar todas as categorias');
  await testRoute('GET', '/categories/disciplinas', null, 'Buscar disciplinas');
  await testRoute('GET', '/categories/bancas', null, 'Buscar bancas');
  await testRoute('GET', '/categories/orgaos', null, 'Buscar órgãos');
  await testRoute('GET', '/questions', null, 'Buscar questões');
  await testRoute('GET', '/planos', null, 'Buscar planos');

  console.log('\n🔐 Testando rotas autenticadas...');
  
  // Rotas autenticadas
  await testRoute('GET', '/users/me', null, 'Buscar dados do usuário');
  await testRoute('GET', '/users/perfil', null, 'Buscar perfil do usuário');
  await testRoute('GET', '/users/estatisticas', null, 'Buscar estatísticas');
  await testRoute('GET', '/users/ranking', null, 'Buscar ranking');
  await testRoute('GET', '/admin/dashboard', null, 'Dashboard admin');
  await testRoute('GET', '/admin/usuarios', null, 'Listar usuários (admin)');
  await testRoute('GET', '/admin/questoes', null, 'Listar questões (admin)');
  await testRoute('GET', '/admin/disciplinas', null, 'Listar disciplinas (admin)');
  await testRoute('GET', '/admin/assuntos', null, 'Listar assuntos (admin)');
  await testRoute('GET', '/admin/bancas', null, 'Listar bancas (admin)');
  await testRoute('GET', '/admin/orgaos', null, 'Listar órgãos (admin)');

  console.log('\n📝 Testando rotas de comentários e avaliações...');
  
  // Rotas de comentários e avaliações
  await testRoute('GET', '/comentarios?questao_id=1', null, 'Buscar comentários de uma questão');
  await testRoute('GET', '/avaliacoes?questao_id=1', null, 'Buscar avaliações de uma questão');
  await testRoute('GET', '/avaliacoes/estatisticas/1', null, 'Buscar estatísticas de avaliação');

  console.log('\n📤 Testando rotas de upload...');
  
  // Rotas de upload
  await testRoute('DELETE', '/upload/profile-picture', null, 'Remover foto de perfil');

  console.log('\n🎯 Testando rotas específicas...');
  
  // Testar resposta de questão
  await testRoute('POST', '/questions/1/responder', {
    alternativa_marcada: 'A',
    tempo_resposta: 30
  }, 'Responder questão');

  // Testar criação de comentário
  await testRoute('POST', '/comentarios', {
    questao_id: 1,
    texto: 'Teste de comentário',
    tipo: 'DUVIDA'
  }, 'Criar comentário');

  // Testar criação de avaliação
  await testRoute('POST', '/avaliacoes', {
    questao_id: 1,
    nota: 5
  }, 'Criar avaliação');

  console.log('\n✅ Testes concluídos!');
  console.log('\n📊 Resumo:');
  console.log('- Se você viu muitos ✅, as rotas estão funcionando corretamente');
  console.log('- Se você viu alguns ❌, verifique se o banco de dados está configurado');
  console.log('- Alguns erros 404 são normais se não houver dados no banco');
}

// Executar testes
testAllRoutes().catch(console.error);
