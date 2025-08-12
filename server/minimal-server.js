const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

// Configuração básica do CORS
app.use(cors());

// Middleware para parsing de JSON
app.use(express.json());

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor minimalista funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Health check funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor minimalista rodando na porta ${PORT}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
});
