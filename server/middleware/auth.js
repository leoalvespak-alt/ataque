const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acesso não fornecido',
        message: 'É necessário fazer login para acessar este recurso'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Buscar usuário no banco
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.ativo) {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      status: user.status,
      tipo_usuario: user.tipo_usuario,
      xp: user.xp
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Token de acesso é inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Sua sessão expirou, faça login novamente'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Erro ao processar autenticação'
    });
  }
};

// Middleware para verificar se é gestor
const requireGestor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Usuário não autenticado',
      message: 'É necessário fazer login para acessar este recurso'
    });
  }
  
  if (req.user.tipo_usuario !== 'gestor') {
    return res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Apenas gestores podem acessar este recurso'
    });
  }
  
  next();
};

// Middleware para verificar se é premium
const requirePremium = (req, res, next) => {
  if (req.user.status !== 'premium') {
    return res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Este recurso é exclusivo para assinantes Premium'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireGestor,
  requirePremium
};
