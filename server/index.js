require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { requestLogger, writeLog } = require('./utils/logger');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const categoryRoutes = require('./routes/categories');
const subscriptionRoutes = require('./routes/subscriptions');
const adminRoutes = require('./routes/admin');
const asaasRoutes = require('./routes/asaas');
const rankingRoutes = require('./routes/ranking');
const planosRoutes = require('./routes/planos');
const uploadRoutes = require('./routes/upload');
const comentariosRoutes = require('./routes/comentarios');
const avaliacoesRoutes = require('./routes/avaliacoes');
const statsRoutes = require('./routes/stats');
const { router: patentesRoutes } = require('./routes/patentes');

// Importar middleware de autenticação
const { authenticateToken } = require('./middleware/auth');

// Importar configuração do banco de dados
const { sequelize } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurações de segurança
app.use(helmet());

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);

// Middleware de logging
app.use(requestLogger);

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para tratamento de erros de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'Requisição inválida',
      message: 'Corpo da requisição JSON malformado'
    });
  }
  next();
});

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subscriptions', authenticateToken, subscriptionRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/asaas', asaasRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/planos', planosRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/patentes', patentesRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rota de Ataque Questões API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  writeLog('ERROR', 'Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id || 'anonymous'
  });
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota para capturar rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar servidor
async function startServer() {
  try {
    // Sincronizar banco de dados (apenas verificar conexão)
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados verificada');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();
