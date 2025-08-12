const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

app.get('/questoes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'questoes.html'));
});

app.get('/ranking', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ranking.html'));
});

app.get('/planos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'planos.html'));
});

app.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'perfil.html'));
});

// Admin routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin/comentarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-comentarios.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.redirect('/admin');
});

app.get('/admin/questoes', (req, res) => {
    res.redirect('/admin');
});

app.get('/admin/disciplinas', (req, res) => {
    res.redirect('/admin');
});

// Fallback for static files
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, 'public', req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('<h1>Página não encontrada</h1>');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor frontend rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
});
