const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { AvaliacaoQuestao, User, Questao } = require('../models');
const { auditLog } = require('../utils/logger');
const router = express.Router();

// GET /api/avaliacoes - Listar avaliações de uma questão
router.get('/', [
  query('questao_id').isInt().withMessage('ID da questão deve ser um número inteiro'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50')
], async (req, res) => {
  try {
    const { questao_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const avaliacoes = await AvaliacaoQuestao.findAndCountAll({
      where: {
        questao_id: parseInt(questao_id)
      },
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nome', 'profile_picture_url']
        }
      ],
      order: [['data_criacao', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calcular estatísticas
    const totalAvaliacoes = avaliacoes.count;
    const mediaNota = totalAvaliacoes > 0 
      ? avaliacoes.rows.reduce((sum, av) => sum + av.nota, 0) / totalAvaliacoes 
      : 0;

    // Contar avaliações por nota
    const contagemNotas = {};
    for (let i = 1; i <= 5; i++) {
      contagemNotas[i] = avaliacoes.rows.filter(av => av.nota === i).length;
    }

    res.json({
      avaliacoes: avaliacoes.rows,
      total: totalAvaliacoes,
      mediaNota: Math.round(mediaNota * 10) / 10,
      contagemNotas,
      page: parseInt(page),
      totalPages: Math.ceil(totalAvaliacoes / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar avaliações'
    });
  }
});

// POST /api/avaliacoes - Criar ou atualizar avaliação
router.post('/', [
  authenticateToken,
  body('questao_id').isInt().withMessage('ID da questão deve ser um número inteiro'),
  body('nota').isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5')
], async (req, res) => {
  try {
    const { questao_id, nota } = req.body;
    const usuario_id = req.user.id;

    // Verificar se a questão existe
    const questao = await Questao.findByPk(questao_id);
    if (!questao) {
      return res.status(404).json({
        error: 'Questão não encontrada',
        message: 'A questão especificada não existe'
      });
    }

    // Verificar se o usuário já avaliou esta questão
    const [avaliacao, created] = await AvaliacaoQuestao.findOrCreate({
      where: { usuario_id, questao_id },
      defaults: { nota }
    });

    if (!created) {
      // Atualizar avaliação existente
      await avaliacao.update({ nota });
    }

    // Log de auditoria
    auditLog(created ? 'CREATE_RATING' : 'UPDATE_RATING', usuario_id, 'AvaliacaoQuestao', {
      avaliacaoId: avaliacao.id,
      questaoId: questao_id,
      nota,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: created ? 'Avaliação criada com sucesso!' : 'Avaliação atualizada com sucesso!',
      avaliacao: {
        id: avaliacao.id,
        nota: avaliacao.nota,
        data_criacao: avaliacao.data_criacao
      }
    });
  } catch (error) {
    console.error('Erro ao criar/atualizar avaliação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar/atualizar avaliação'
    });
  }
});

// GET /api/avaliacoes/minha/:questao_id - Verificar avaliação do usuário
router.get('/minha/:questao_id', [
  authenticateToken,
  param('questao_id').isInt().withMessage('ID da questão deve ser um número inteiro')
], async (req, res) => {
  try {
    const { questao_id } = req.params;
    const usuario_id = req.user.id;

    const avaliacao = await AvaliacaoQuestao.findOne({
      where: { usuario_id, questao_id }
    });

    res.json({
      avaliacao: avaliacao ? {
        id: avaliacao.id,
        nota: avaliacao.nota,
        data_criacao: avaliacao.data_criacao
      } : null
    });
  } catch (error) {
    console.error('Erro ao buscar avaliação do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar avaliação'
    });
  }
});

// DELETE /api/avaliacoes/:questao_id - Remover avaliação
router.delete('/:questao_id', [
  authenticateToken,
  param('questao_id').isInt().withMessage('ID da questão deve ser um número inteiro')
], async (req, res) => {
  try {
    const { questao_id } = req.params;
    const usuario_id = req.user.id;

    const avaliacao = await AvaliacaoQuestao.findOne({
      where: { usuario_id, questao_id }
    });

    if (!avaliacao) {
      return res.status(404).json({
        error: 'Avaliação não encontrada',
        message: 'Você não avaliou esta questão'
      });
    }

    await avaliacao.destroy();

    // Log de auditoria
    auditLog('DELETE_RATING', usuario_id, 'AvaliacaoQuestao', {
      avaliacaoId: avaliacao.id,
      questaoId: questao_id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Avaliação removida com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao remover avaliação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao remover avaliação'
    });
  }
});

// GET /api/avaliacoes/estatisticas/:questao_id - Estatísticas de avaliação
router.get('/estatisticas/:questao_id', [
  param('questao_id').isInt().withMessage('ID da questão deve ser um número inteiro')
], async (req, res) => {
  try {
    const { questao_id } = req.params;

    const avaliacoes = await AvaliacaoQuestao.findAll({
      where: { questao_id: parseInt(questao_id) },
      attributes: ['nota']
    });

    const totalAvaliacoes = avaliacoes.length;
    const mediaNota = totalAvaliacoes > 0 
      ? avaliacoes.reduce((sum, av) => sum + av.nota, 0) / totalAvaliacoes 
      : 0;

    // Contar avaliações por nota
    const contagemNotas = {};
    for (let i = 1; i <= 5; i++) {
      contagemNotas[i] = avaliacoes.filter(av => av.nota === i).length;
    }

    // Calcular percentuais
    const percentuais = {};
    for (let i = 1; i <= 5; i++) {
      percentuais[i] = totalAvaliacoes > 0 ? (contagemNotas[i] / totalAvaliacoes) * 100 : 0;
    }

    res.json({
      questao_id: parseInt(questao_id),
      totalAvaliacoes,
      mediaNota: Math.round(mediaNota * 10) / 10,
      contagemNotas,
      percentuais
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar estatísticas de avaliação'
    });
  }
});

module.exports = router;
