const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');

const router = express.Router();

// Validações para cadastro
const validateCadastro = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Cadastro de usuário
router.post('/cadastro', validateCadastro, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, email, senha } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email já cadastrado',
        message: 'Este email já está sendo usado por outro usuário'
      });
    }

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      senha, // Será hasheada automaticamente pelo hook
      status: 'gratuito',
      tipo_usuario: 'aluno'
    });

    // Gerar token JWT
    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui';
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Atualizar último login
    await user.update({ ultimo_login: new Date() });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        status: user.status,
        tipo_usuario: user.tipo_usuario,
        xp: user.xp
      },
      token
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao cadastrar usuário'
    });
  }
});

// Login de usuário
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, senha } = req.body;

    // Buscar usuário
    console.log('Buscando usuário:', email);
    const user = await User.findOne({ where: { email } });
    console.log('Usuário encontrado:', user ? 'sim' : 'não');
    console.log('Usuário ativo:', user?.ativo);
    if (!user || !user.ativo) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    console.log('Senha fornecida:', senha);
    console.log('Hash armazenado:', user.hash_senha);
    const senhaValida = await bcrypt.compare(senha, user.hash_senha);
    console.log('Senha válida?', senhaValida);
    if (!senhaValida) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Sucesso
    console.log('Login bem-sucedido!');

    // Gerar token JWT
    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui';
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Atualizar último login
    await user.update({ ultimo_login: new Date() });

    res.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        status: user.status,
        tipo_usuario: user.tipo_usuario,
        xp: user.xp,
        questoes_respondidas: user.questoes_respondidas
      },
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao fazer login'
    });
  }
});

// Verificar token (rota protegida)
router.get('/verificar', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Token de acesso é necessário'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui');
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.ativo) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Usuário não encontrado ou inativo'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        status: user.status,
        tipo_usuario: user.tipo_usuario,
        xp: user.xp,
        questoes_respondidas: user.questoes_respondidas
      }
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Token inválido',
      message: 'Token de acesso é inválido ou expirado'
    });
  }
});

// Verificar token (rota pública)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Token de acesso é necessário'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui');
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.ativo) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Usuário não encontrado ou inativo'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        status: user.status,
        tipo_usuario: user.tipo_usuario,
        xp: user.xp,
        questoes_respondidas: user.questoes_respondidas
      }
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Token inválido',
      message: 'Token de acesso é inválido ou expirado'
    });
  }
});

module.exports = router;
