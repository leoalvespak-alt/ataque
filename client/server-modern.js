const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001; // Porta diferente do Vite

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Proxy para API (backend)
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  secure: false,
  logLevel: 'debug'
}));

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

// Rota principal - redireciona para o Vite React App
app.get('/', (req, res) => {
    res.redirect('http://localhost:3000');
});

// Rotas para páginas HTML modernas
app.get('/questoes-modern', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'questoes-modern.html'));
});

app.get('/ranking-modern', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ranking-modern.html'));
});

app.get('/planos-modern', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'planos-modern.html'));
});

app.get('/perfil-modern', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'perfil-modern.html'));
});

app.get('/dashboard-modern', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard-modern.html'));
});

app.get('/demo-modern', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'demo-modern.html'));
});

app.get('/base-modern', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'base-modern.html'));
});

// Rotas admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin/comentarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-comentarios.html'));
});

app.get('/admin/questoes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-questoes.html'));
});

app.get('/admin/usuarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-usuarios.html'));
});

app.get('/admin/relatorios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-relatorios.html'));
});

app.get('/admin/configuracoes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-configuracoes.html'));
});

app.get('/admin/planos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-planos.html'));
});

app.get('/admin/categorias', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-categorias.html'));
});

app.get('/admin/scripts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-scripts.html'));
});

app.get('/admin/comentarios-scripts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-comentarios-scripts.html'));
});

// Rotas admin com hífen (para compatibilidade)
app.get('/admin-usuarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-usuarios.html'));
});

app.get('/admin-questoes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-questoes.html'));
});

app.get('/admin-relatorios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-relatorios.html'));
});

app.get('/admin-configuracoes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-configuracoes.html'));
});

app.get('/admin-planos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-planos.html'));
});

app.get('/admin-categorias', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-categorias.html'));
});

app.get('/admin-scripts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-scripts.html'));
});

app.get('/admin-comentarios-scripts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-comentarios-scripts.html'));
});

// Rotas de autenticação
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// Rotas de dashboard
app.get('/dashboard-aluno', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard-aluno.html'));
});

app.get('/dashboard-gestor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard-gestor.html'));
});

// Rotas adicionais
app.get('/planos-scripts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'planos-scripts.html'));
});

// Fallback para arquivos estáticos
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, 'public', req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('<h1>Página não encontrada</h1><p><a href="http://localhost:3000">Voltar para página inicial</a></p>');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de páginas HTML modernas rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🔗 Vite React: http://localhost:3000`);
    console.log(`🔗 API Backend: http://localhost:3002`);
});
