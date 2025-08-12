require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Configuração básica do CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));

// Middleware para parsing de JSON
app.use(express.json());

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor simples funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste de login
app.post('/api/auth/login', (req, res) => {
  console.log('Requisição de login recebida:', req.body);
  res.json({
    message: 'Login de teste',
    token: 'test-token',
    user: {
      id: 1,
      nome: 'Usuário Teste',
      email: req.body.email,
      tipo_usuario: 'aluno'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor simples rodando na porta ${PORT}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
});
