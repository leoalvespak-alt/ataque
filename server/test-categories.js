const http = require('http');

console.log('Testando rotas de categorias...');

// Testar rota de todas as categorias
const req1 = http.get('http://localhost:3002/api/categories/todas', (res) => {
  console.log(`Status categorias/todas: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta categorias/todas:', data);
  });
});

req1.on('error', (e) => {
  console.error(`Erro categorias/todas: ${e.message}`);
});

// Testar rota de disciplinas
const req2 = http.get('http://localhost:3002/api/categories/disciplinas', (res) => {
  console.log(`Status categorias/disciplinas: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta categorias/disciplinas:', data);
  });
});

req2.on('error', (e) => {
  console.error(`Erro categorias/disciplinas: ${e.message}`);
});

// Testar rota de questões
const req3 = http.get('http://localhost:3002/api/questions', (res) => {
  console.log(`Status questions: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta questions:', data);
  });
});

req3.on('error', (e) => {
  console.error(`Erro questions: ${e.message}`);
});
