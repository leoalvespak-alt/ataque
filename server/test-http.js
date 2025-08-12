const http = require('http');

console.log('🚀 Testando com HTTP nativo...\n');

// Testar health check
const req = http.get('http://127.0.0.1:3003/api/health', (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
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
