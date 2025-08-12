const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { ComentarioAluno, User, Questao } = require('../models');
const { auditLog } = require('../utils/logger');
const router = express.Router();

// GET /api/comentarios - Listar comentários de uma questão
router.get('/', [
  query('questao_id').isInt().withMessage('ID da questão deve ser um número inteiro'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50')
], async (req, res) => {
  try {
    const { questao_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const comentarios = await ComentarioAluno.findAndCountAll({
      where: {
        questao_id: parseInt(questao_id),
        aprovado: true // Apenas comentários aprovados
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

    res.json({
      comentarios: comentarios.rows,
      total: comentarios.count,
      page: parseInt(page),
      totalPages: Math.ceil(comentarios.count / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar comentários'
    });
  }
});

// POST /api/comentarios - Criar novo comentário
router.post('/', [
  authenticateToken,
  body('questao_id').isInt().withMessage('ID da questão deve ser um número inteiro'),
  body('texto').isLength({ min: 3, max: 1000 }).withMessage('Comentário deve ter entre 3 e 1000 caracteres'),
  body('tipo').optional().isIn(['DUVIDA', 'SUGESTAO', 'ERRO', 'ELOGIO', 'GERAL']).withMessage('Tipo inválido')
], async (req, res) => {
  try {
    const { questao_id, texto, tipo = 'GERAL' } = req.body;
    const usuario_id = req.user.id;

    // Verificar se a questão existe
    const questao = await Questao.findByPk(questao_id);
    if (!questao) {
      return res.status(404).json({
        error: 'Questão não encontrada',
        message: 'A questão especificada não existe'
      });
    }

    // Verificar se o usuário já comentou nesta questão (opcional - pode permitir múltiplos comentários)
    const comentarioExistente = await ComentarioAluno.findOne({
      where: { usuario_id, questao_id }
    });

    if (comentarioExistente) {
      return res.status(400).json({
        error: 'Comentário já existe',
        message: 'Você já comentou nesta questão'
      });
    }

    const comentario = await ComentarioAluno.create({
      texto: texto.trim(),
      tipo,
      usuario_id,
      questao_id,
      aprovado: false // Comentários precisam ser aprovados pelo admin
    });

    // Log de auditoria
    auditLog('CREATE_COMMENT', usuario_id, 'ComentarioAluno', {
      comentarioId: comentario.id,
      questaoId: questao_id,
      tipo,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'Comentário criado com sucesso! Aguardando aprovação.',
      comentario: {
        id: comentario.id,
        texto: comentario.texto,
        tipo: comentario.tipo,
        data_criacao: comentario.data_criacao,
        aprovado: comentario.aprovado
      }
    });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar comentário'
    });
  }
});

// PUT /api/comentarios/:id/like - Dar like em um comentário
router.put('/:id/like', [
  authenticateToken,
  param('id').isInt().withMessage('ID do comentário deve ser um número inteiro')
], async (req, res) => {
  try {
    const { id } = req.params;
    const comentario = await ComentarioAluno.findByPk(id);

    if (!comentario) {
      return res.status(404).json({
        error: 'Comentário não encontrado',
        message: 'O comentário especificado não existe'
      });
    }

    if (!comentario.aprovado) {
      return res.status(400).json({
        error: 'Comentário não aprovado',
        message: 'Não é possível dar like em um comentário não aprovado'
      });
    }

    // Incrementar likes
    await comentario.increment('likes');

    res.json({
      message: 'Like adicionado com sucesso!',
      likes: comentario.likes + 1
    });
  } catch (error) {
    console.error('Erro ao dar like:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao dar like no comentário'
    });
  }
});

// DELETE /api/comentarios/:id - Deletar próprio comentário
router.delete('/:id', [
  authenticateToken,
  param('id').isInt().withMessage('ID do comentário deve ser um número inteiro')
], async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    const comentario = await ComentarioAluno.findOne({
      where: { id, usuario_id }
    });

    if (!comentario) {
      return res.status(404).json({
        error: 'Comentário não encontrado',
        message: 'O comentário especificado não existe ou não pertence a você'
      });
    }

    await comentario.destroy();

    // Log de auditoria
    auditLog('DELETE_COMMENT', usuario_id, 'ComentarioAluno', {
      comentarioId: id,
      questaoId: comentario.questao_id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Comentário deletado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar comentário'
    });
  }
});

module.exports = router;
