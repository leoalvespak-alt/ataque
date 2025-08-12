const http = require('http');

console.log('Testando conexão com servidor...');

const req = http.get('http://localhost:3002/api/health', (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta:', data);
  });
});

req.on('error', (e) => {
  console.error(`Erro: ${e.message}`);
});

req.setTimeout(5000, () => {
  console.error('Timeout - servidor não respondeu em 5 segundos');
  req.destroy();
});
