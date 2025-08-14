const express = require('express');
const { query } = require('express-validator');
const { User, RespostaUsuario } = require('../models');
const { sequelize } = require('../config/database');

const router = express.Router();

// Buscar ranking de alunos
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('period').optional().isIn(['all', 'week', 'month', 'year']),
  query('status').optional().isIn(['all', 'premium', 'gratuito'])
], async (req, res) => {
  try {
    const { page = 1, limit = 20, period = 'all', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    // Construir where clause
    const where = { tipo_usuario: 'aluno' };
    
    if (status !== 'all') {
      where.status = status;
    }

    // Construir where para período se especificado
    let periodWhere = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (startDate) {
        periodWhere.created_at = {
          [sequelize.Op.gte]: startDate
        };
      }
    }

    // Buscar alunos com XP
    const alunos = await User.findAndCountAll({
      where,
      attributes: [
        'id', 'nome', 'email', 'xp', 'status', 'questoes_respondidas',
        [sequelize.fn('COALESCE', sequelize.col('xp'), 0), 'xp']
      ],
      order: [
        [sequelize.fn('COALESCE', sequelize.col('xp'), 0), 'DESC'],
        ['questoes_respondidas', 'DESC'],
        ['nome', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calcular paginação
    const totalPages = Math.ceil(alunos.count / limit);

    res.json({
      success: true,
      alunos: alunos.rows,
      pagination: {
        total: alunos.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });

  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ranking'
    });
  }
});

// Buscar estatísticas do ranking
router.get('/stats', async (req, res) => {
  try {
    const [
      totalAlunos,
      totalXP,
      mediaXP,
      totalRespostas
    ] = await Promise.all([
      User.count({ where: { tipo_usuario: 'aluno' } }),
      User.sum('xp', { where: { tipo_usuario: 'aluno' } }),
      User.findOne({
        where: { tipo_usuario: 'aluno' },
        attributes: [
          [sequelize.fn('AVG', sequelize.fn('COALESCE', sequelize.col('xp'), 0)), 'media_xp']
        ],
        raw: true
      }),
      RespostaUsuario.count()
    ]);

    res.json({
      success: true,
      totalAlunos: totalAlunos || 0,
      totalXP: totalXP || 0,
      mediaXP: parseFloat(mediaXP?.media_xp || 0),
      questoesRespondidas: totalRespostas || 0
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

// Buscar ranking do usuário logado
router.get('/me', async (req, res) => {
  try {
    // Verificar se usuário está logado
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const usuario = await User.findByPk(decoded.userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Buscar posição do usuário no ranking
    const posicao = await User.count({
      where: {
        tipo_usuario: 'aluno',
        xp: {
          [sequelize.Op.gt]: usuario.xp || 0
        }
      }
    });

    // Buscar usuários próximos (5 acima e 5 abaixo)
    const usuariosProximos = await User.findAll({
      where: { tipo_usuario: 'aluno' },
      attributes: ['id', 'nome', 'xp', 'questoes_respondidas', 'status'],
      order: [
        [sequelize.fn('COALESCE', sequelize.col('xp'), 0), 'DESC'],
        ['questoes_respondidas', 'DESC']
      ],
      limit: 11,
      offset: Math.max(0, posicao - 5)
    });

    res.json({
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        xp: usuario.xp || 0,
        questoes_respondidas: usuario.questoes_respondidas || 0,
        status: usuario.status,
        posicao: posicao + 1
      },
      usuariosProximos
    });

  } catch (error) {
    console.error('Erro ao buscar ranking do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ranking do usuário'
    });
  }
});

module.exports = router;


