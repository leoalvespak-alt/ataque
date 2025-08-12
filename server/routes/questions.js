const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Questao, Disciplina, Assunto, Banca, Orgao, RespostaUsuario, ComentarioAluno, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { verificarEAtualizarPatente } = require('./patentes');

const router = express.Router();

// Buscar questões com filtros e paginação
router.get('/', [
  query('disciplina_id').optional().isInt(),
  query('assunto_id').optional().isInt(),
  query('banca_id').optional().isInt(),
  query('orgao_id').optional().isInt(),
  query('ano').optional().isInt(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim(),
  query('sort').optional().isIn(['id', 'ano', 'created_at']),
  query('order').optional().isIn(['ASC', 'DESC']),
  query('status_resposta').optional().isIn(['correta', 'errada', 'nao_respondida']),
  query('ocultar_respondidas').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const {
      disciplina_id,
      assunto_id,
      banca_id,
      orgao_id,
      ano,
      page = 1,
      limit = 10,
      search,
      sort = 'id',
      order = 'DESC',
      status_resposta,
      ocultar_respondidas
    } = req.query;

    // Construir filtros
    const where = { ativo: true };
    if (disciplina_id) where.disciplina_id = disciplina_id;
    if (assunto_id) where.assunto_id = assunto_id;
    if (banca_id) where.banca_id = banca_id;
    if (orgao_id) where.orgao_id = orgao_id;
    if (ano) where.ano = ano;
    
    // Adicionar busca por texto no enunciado
    if (search) {
      where.enunciado = {
        [require('sequelize').Op.iLike]: `%${search}%`
      };
    }

    // Configurar includes baseados nos filtros
    const includes = [
      { model: Disciplina, as: 'disciplina', attributes: ['id', 'nome'] },
      { model: Assunto, as: 'assunto', attributes: ['id', 'nome'] },
      { model: Banca, as: 'banca', attributes: ['id', 'nome'] },
      { model: Orgao, as: 'orgao', attributes: ['id', 'nome'] }
    ];

    // Adicionar filtros de resposta se especificados
    if (status_resposta || ocultar_respondidas === 'true') {
      const userId = req.user?.id;
      
      if (userId) {
        includes.push({
          model: RespostaUsuario,
          as: 'respostaUsuario',
          where: { usuario_id: userId },
          required: false,
          attributes: ['alternativa_marcada', 'acertou']
        });

        // Filtrar por status de resposta
        if (status_resposta) {
          if (status_resposta === 'correta') {
            where['$respostaUsuario.acertou$'] = true;
          } else if (status_resposta === 'errada') {
            where['$respostaUsuario.acertou$'] = false;
          } else if (status_resposta === 'nao_respondida') {
            where['$respostaUsuario.id$'] = null;
          }
        }

        // Ocultar questões respondidas
        if (ocultar_respondidas === 'true') {
          where['$respostaUsuario.id$'] = null;
        }
      }
    }

    // Configurar ordenação
    const orderBy = [[sort, order]];

    // Buscar questões com paginação
    const offset = (page - 1) * limit;
    const questoes = await Questao.findAndCountAll({
      where,
      include: includes,
      attributes: [
        'id', 'enunciado', 'ano', 'gabarito', 'tipo',
        'alternativa_a', 'alternativa_b', 'alternativa_c', 'alternativa_d', 'alternativa_e'
      ],
      order: orderBy,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      questoes: questoes.rows,
      pagination: {
        total: questoes.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(questoes.count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar questões'
    });
  }
});

// Buscar questão específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const questao = await Questao.findOne({
      where: { id, ativo: true },
      include: [
        { model: Disciplina, as: 'disciplina', attributes: ['id', 'nome'] },
        { model: Assunto, as: 'assunto', attributes: ['id', 'nome'] },
        { model: Banca, as: 'banca', attributes: ['id', 'nome'] },
        { model: Orgao, as: 'orgao', attributes: ['id', 'nome'] }
      ]
    });

    if (!questao) {
      return res.status(404).json({
        error: 'Questão não encontrada',
        message: 'A questão solicitada não foi encontrada'
      });
    }

    res.json({ questao });

  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar questão'
    });
  }
});

// Responder questão
router.post('/:id/responder', authenticateToken, [
  body('alternativa_marcada')
    .isIn(['A', 'B', 'C', 'D', 'E'])
    .withMessage('Alternativa deve ser A, B, C, D ou E'),
  body('tempo_resposta')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tempo de resposta deve ser um número inteiro positivo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { alternativa_marcada, tempo_resposta } = req.body;
    const userId = req.user.id;

    // Buscar usuário
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se pode responder (usuário gratuito)
    if (!user.podeResponderQuestao()) {
      return res.status(403).json({
        error: 'Limite de questões atingido',
        message: 'Você atingiu o limite de 10 questões gratuitas. Faça upgrade para Premium para continuar estudando!',
        upgradeRequired: true
      });
    }

    // Buscar questão
    const questao = await Questao.findByPk(id);
    if (!questao || !questao.ativo) {
      return res.status(404).json({
        error: 'Questão não encontrada',
        message: 'A questão solicitada não foi encontrada'
      });
    }

    // Verificar se já respondeu esta questão
    const respostaExistente = await RespostaUsuario.findOne({
      where: { usuario_id: userId, questao_id: id }
    });

    // Se já respondeu, atualizar a resposta existente em vez de bloquear
    if (respostaExistente) {
      const acertou = alternativa_marcada === questao.gabarito;
      
      await respostaExistente.update({
        alternativa_marcada,
        acertou,
        tempo_resposta: tempo_resposta || null
      });

      res.json({
        message: acertou ? 'Parabéns! Você acertou!' : 'Você errou. Continue estudando!',
        acertou,
        gabarito: questao.gabarito,
        alternativa_marcada,
        xpGanho: acertou ? 20 : 0,
        novoXP: user.xp + (acertou ? 20 : 0),
        questoes_respondidas: user.questoes_respondidas,
        respostaAtualizada: true
      });
      return;
    }

    // Verificar se acertou
    const acertou = alternativa_marcada === questao.gabarito;

    // Salvar resposta
    await RespostaUsuario.create({
      usuario_id: userId,
      questao_id: id,
      alternativa_marcada,
      acertou,
      tempo_resposta: tempo_resposta || null
    });

    // Atualizar contador de questões respondidas
    await user.update({
      questoes_respondidas: user.questoes_respondidas + 1
    });

    // Adicionar XP se acertou
    let novaPatente = null;
    if (acertou) {
      await user.adicionarXP(20);
      
      // Verificar se ganhou uma nova patente
      novaPatente = await verificarEAtualizarPatente(userId);
    }

    // Buscar dados atualizados do usuário
    const userAtualizado = await User.findByPk(userId, {
      include: [{ model: require('../models').Patente, as: 'patente' }]
    });

    res.json({
      message: acertou ? 'Parabéns! Você acertou!' : 'Você errou. Continue estudando!',
      acertou,
      gabarito: questao.gabarito,
      alternativa_marcada,
      xpGanho: acertou ? 20 : 0,
      novoXP: userAtualizado.xp,
      questoes_respondidas: userAtualizado.questoes_respondidas,
      patente: userAtualizado.patente ? {
        id: userAtualizado.patente.id,
        nome: userAtualizado.patente.nome,
        descricao: userAtualizado.patente.descricao,
        icone: userAtualizado.patente.icone,
        cor: userAtualizado.patente.cor
      } : null,
      novaPatente: novaPatente ? {
        id: novaPatente.id,
        nome: novaPatente.nome,
        descricao: novaPatente.descricao,
        icone: novaPatente.icone,
        cor: novaPatente.cor
      } : null
    });

  } catch (error) {
    console.error('Erro ao responder questão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao processar resposta'
    });
  }
});

// Verificar se usuário já respondeu uma questão
router.get('/:id/resposta', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resposta = await RespostaUsuario.findOne({
      where: { usuario_id: userId, questao_id: id }
    });

    res.json({
      resposta: resposta ? {
        alternativa_marcada: resposta.alternativa_marcada,
        acertou: resposta.acertou,
        tempo_resposta: resposta.tempo_resposta
      } : null
    });

  } catch (error) {
    console.error('Erro ao verificar resposta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar resposta'
    });
  }
});

// Buscar comentários de uma questão
router.get('/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const comentarios = await ComentarioAluno.findAndCountAll({
      where: { 
        questao_id: id,
        aprovado: true 
      },
      include: [
        { 
          model: User, 
          as: 'usuario', 
          attributes: ['id', 'nome'] 
        }
      ],
      order: [['data_criacao', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      comentarios: comentarios.rows,
      pagination: {
        total: comentarios.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(comentarios.count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar comentários'
    });
  }
});

// Adicionar comentário a uma questão
router.post('/:id/comentarios', authenticateToken, [
  body('texto')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comentário deve ter entre 10 e 1000 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { texto } = req.body;
    const userId = req.user.id;

    // Verificar se questão existe
    const questao = await Questao.findByPk(id);
    if (!questao || !questao.ativo) {
      return res.status(404).json({
        error: 'Questão não encontrada',
        message: 'A questão solicitada não foi encontrada'
      });
    }

    // Criar comentário
    const comentario = await ComentarioAluno.create({
      texto,
      usuario_id: userId,
      questao_id: id,
      aprovado: false // Comentários precisam ser aprovados pelo gestor
    });

    res.status(201).json({
      message: 'Comentário enviado com sucesso! Aguarde aprovação.',
      comentario: {
        id: comentario.id,
        texto: comentario.texto,
        data_criacao: comentario.data_criacao
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao adicionar comentário'
    });
  }
});

module.exports = router;
