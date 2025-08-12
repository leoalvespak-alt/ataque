const express = require('express');
const { body, validationResult, query } = require('express-validator');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { auditLog } = require('../utils/logger');
const { 
  User, Questao, Disciplina, Assunto, Banca, Orgao, 
  RespostaUsuario, ComentarioAluno, PlanoAssinatura, 
  AssinaturaUsuario, ConfiguracaoPlataforma 
} = require('../models');
const { requireGestor } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Aplicar middleware de gestor em todas as rotas
router.use(requireGestor);

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/x-icon' || file.mimetype === 'image/vnd.microsoft.icon';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'));
    }
  }
});

// Dashboard - Estatísticas gerais
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsuarios,
      usuariosGratuitos,
      usuariosPremium,
      totalQuestoes,
      totalDisciplinas,
      totalAssuntos,
      totalBancas,
      totalOrgaos,
      assinaturasAtivas,
      comentariosPendentes
    ] = await Promise.all([
      User.count({ where: { tipo_usuario: 'aluno' } }),
      User.count({ where: { tipo_usuario: 'aluno', status: 'gratuito' } }),
      User.count({ where: { tipo_usuario: 'aluno', status: 'premium' } }),
      Questao.count({ where: { ativo: true } }),
      Disciplina.count({ where: { ativo: true } }),
      Assunto.count({ where: { ativo: true } }),
      Banca.count({ where: { ativo: true } }),
      Orgao.count({ where: { ativo: true } }),
      AssinaturaUsuario.count({ where: { status: 'ativa' } }),
      ComentarioAluno.count({ where: { aprovado: false } })
    ]);

    // Calcular estatísticas adicionais
    const totalRespostas = await RespostaUsuario.count();
    const mediaXPResult = await User.findOne({
      where: { tipo_usuario: 'aluno' },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('xp')), 'media_xp']
      ],
      raw: true
    });
    
    const mediaXP = mediaXPResult?.media_xp || 0;

    res.json({
      success: true,
      stats: {
        totalUsuarios,
        totalQuestoes,
        totalRespostas,
        mediaXP: parseFloat(mediaXP),
        usuariosGratuitos,
        usuariosPremium,
        totalDisciplinas,
        totalAssuntos,
        totalBancas,
        totalOrgaos,
        assinaturasAtivas,
        comentariosPendentes
      },
      estatisticas: {
        usuarios: {
          total: totalUsuarios,
          gratuitos: usuariosGratuitos,
          premium: usuariosPremium
        },
        questoes: totalQuestoes,
        categorias: {
          disciplinas: totalDisciplinas,
          assuntos: totalAssuntos,
          bancas: totalBancas,
          orgaos: totalOrgaos
        },
        assinaturas: assinaturasAtivas,
        comentariosPendentes
      }
    });

  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar estatísticas'
    });
  }
});

// Gerenciamento de Disciplinas
router.get('/disciplinas', async (req, res) => {
  try {
    const disciplinas = await Disciplina.findAll({
      order: [['nome', 'ASC']]
    });

    res.json({ disciplinas });
  } catch (error) {
    console.error('Erro ao buscar disciplinas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar disciplinas'
    });
  }
});

router.post('/disciplinas', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, descricao } = req.body;

    const disciplina = await Disciplina.create({
      nome: nome.trim(),
      descricao: descricao?.trim() || null
    });

    res.status(201).json({
      message: 'Disciplina criada com sucesso!',
      disciplina
    });

  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar disciplina'
    });
  }
});

// Gerenciamento de Assuntos
router.get('/assuntos', async (req, res) => {
  try {
    const assuntos = await Assunto.findAll({
      include: [
        { model: Disciplina, as: 'disciplina', attributes: ['id', 'nome'] }
      ],
      order: [['nome', 'ASC']]
    });

    res.json({ assuntos });
  } catch (error) {
    console.error('Erro ao buscar assuntos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar assuntos'
    });
  }
});

router.post('/assuntos', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('disciplina_id').isInt().withMessage('Disciplina é obrigatória'),
  body('descricao').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, disciplina_id, descricao } = req.body;

    // Verificar se disciplina existe
    const disciplina = await Disciplina.findByPk(disciplina_id);
    if (!disciplina) {
      return res.status(404).json({
        error: 'Disciplina não encontrada',
        message: 'A disciplina selecionada não existe'
      });
    }

    const assunto = await Assunto.create({
      nome: nome.trim(),
      disciplina_id,
      descricao: descricao?.trim() || null
    });

    res.status(201).json({
      message: 'Assunto criado com sucesso!',
      assunto
    });

  } catch (error) {
    console.error('Erro ao criar assunto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar assunto'
    });
  }
});

// Atualizar disciplina
router.put('/disciplinas/:id', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim()
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
    const { nome, descricao } = req.body;

    const disciplina = await Disciplina.findByPk(id);
    if (!disciplina) {
      return res.status(404).json({
        error: 'Disciplina não encontrada',
        message: 'A disciplina selecionada não existe'
      });
    }

    await disciplina.update({
      nome: nome.trim(),
      descricao: descricao?.trim() || null
    });

    res.json({
      message: 'Disciplina atualizada com sucesso!',
      disciplina
    });

  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar disciplina'
    });
  }
});

// Excluir disciplina
router.delete('/disciplinas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const disciplina = await Disciplina.findByPk(id);
    if (!disciplina) {
      return res.status(404).json({
        error: 'Disciplina não encontrada',
        message: 'A disciplina selecionada não existe'
      });
    }

    // Verificar se há assuntos vinculados
    const assuntosVinculados = await Assunto.count({ where: { disciplina_id: id } });
    if (assuntosVinculados > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir disciplina',
        message: 'Existem assuntos vinculados a esta disciplina'
      });
    }

    await disciplina.destroy();

    res.json({
      message: 'Disciplina excluída com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao excluir disciplina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir disciplina'
    });
  }
});

// Gerenciamento de Bancas
router.get('/bancas', async (req, res) => {
  try {
    const bancas = await Banca.findAll({
      order: [['nome', 'ASC']]
    });

    res.json({ bancas });
  } catch (error) {
    console.error('Erro ao buscar bancas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar bancas'
    });
  }
});

router.post('/bancas', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, descricao } = req.body;

    const banca = await Banca.create({
      nome: nome.trim(),
      descricao: descricao?.trim() || null
    });

    res.status(201).json({
      message: 'Banca criada com sucesso!',
      banca
    });

  } catch (error) {
    console.error('Erro ao criar banca:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar banca'
    });
  }
});

// Atualizar banca
router.put('/bancas/:id', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim()
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
    const { nome, descricao } = req.body;

    const banca = await Banca.findByPk(id);
    if (!banca) {
      return res.status(404).json({
        error: 'Banca não encontrada',
        message: 'A banca selecionada não existe'
      });
    }

    await banca.update({
      nome: nome.trim(),
      descricao: descricao?.trim() || null
    });

    res.json({
      message: 'Banca atualizada com sucesso!',
      banca
    });

  } catch (error) {
    console.error('Erro ao atualizar banca:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar banca'
    });
  }
});

// Excluir banca
router.delete('/bancas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const banca = await Banca.findByPk(id);
    if (!banca) {
      return res.status(404).json({
        error: 'Banca não encontrada',
        message: 'A banca selecionada não existe'
      });
    }

    // Verificar se há questões vinculadas
    const questoesVinculadas = await Questao.count({ where: { banca_id: id } });
    if (questoesVinculadas > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir banca',
        message: 'Existem questões vinculadas a esta banca'
      });
    }

    await banca.destroy();

    res.json({
      message: 'Banca excluída com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao excluir banca:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir banca'
    });
  }
});

// Gerenciamento de Órgãos
router.get('/orgaos', async (req, res) => {
  try {
    const orgaos = await Orgao.findAll({
      order: [['nome', 'ASC']]
    });

    res.json({ orgaos });
  } catch (error) {
    console.error('Erro ao buscar órgãos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar órgãos'
    });
  }
});

router.post('/orgaos', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, descricao } = req.body;

    const orgao = await Orgao.create({
      nome: nome.trim(),
      descricao: descricao?.trim() || null
    });

    res.status(201).json({
      message: 'Órgão criado com sucesso!',
      orgao
    });

  } catch (error) {
    console.error('Erro ao criar órgão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar órgão'
    });
  }
});

// Atualizar assunto
router.put('/assuntos/:id', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('disciplina_id').isInt().withMessage('Disciplina é obrigatória'),
  body('descricao').optional().trim()
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
    const { nome, disciplina_id, descricao } = req.body;

    const assunto = await Assunto.findByPk(id);
    if (!assunto) {
      return res.status(404).json({
        error: 'Assunto não encontrado',
        message: 'O assunto selecionado não existe'
      });
    }

    // Verificar se disciplina existe
    const disciplina = await Disciplina.findByPk(disciplina_id);
    if (!disciplina) {
      return res.status(404).json({
        error: 'Disciplina não encontrada',
        message: 'A disciplina selecionada não existe'
      });
    }

    await assunto.update({
      nome: nome.trim(),
      disciplina_id,
      descricao: descricao?.trim() || null
    });

    res.json({
      message: 'Assunto atualizado com sucesso!',
      assunto
    });

  } catch (error) {
    console.error('Erro ao atualizar assunto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar assunto'
    });
  }
});

// Excluir assunto
router.delete('/assuntos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const assunto = await Assunto.findByPk(id);
    if (!assunto) {
      return res.status(404).json({
        error: 'Assunto não encontrado',
        message: 'O assunto selecionado não existe'
      });
    }

    // Verificar se há questões vinculadas
    const questoesVinculadas = await Questao.count({ where: { assunto_id: id } });
    if (questoesVinculadas > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir assunto',
        message: 'Existem questões vinculadas a este assunto'
      });
    }

    await assunto.destroy();

    res.json({
      message: 'Assunto excluído com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao excluir assunto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir assunto'
    });
  }
});

// Atualizar órgão
router.put('/orgaos/:id', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim()
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
    const { nome, descricao } = req.body;

    const orgao = await Orgao.findByPk(id);
    if (!orgao) {
      return res.status(404).json({
        error: 'Órgão não encontrado',
        message: 'O órgão selecionado não existe'
      });
    }

    await orgao.update({
      nome: nome.trim(),
      descricao: descricao?.trim() || null
    });

    res.json({
      message: 'Órgão atualizado com sucesso!',
      orgao
    });

  } catch (error) {
    console.error('Erro ao atualizar órgão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar órgão'
    });
  }
});

// Excluir órgão
router.delete('/orgaos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orgao = await Orgao.findByPk(id);
    if (!orgao) {
      return res.status(404).json({
        error: 'Órgão não encontrado',
        message: 'O órgão selecionado não existe'
      });
    }

    // Verificar se há questões vinculadas
    const questoesVinculadas = await Questao.count({ where: { orgao_id: id } });
    if (questoesVinculadas > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir órgão',
        message: 'Existem questões vinculadas a este órgão'
      });
    }

    await orgao.destroy();

    res.json({
      message: 'Órgão excluído com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao excluir órgão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir órgão'
    });
  }
});

// Gerenciamento de Questões
router.get('/questoes', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('disciplina_id').optional().isInt(),
  query('banca_id').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { page = 1, limit = 10, disciplina_id, banca_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (disciplina_id) where.disciplina_id = disciplina_id;
    if (banca_id) where.banca_id = banca_id;

    const questoes = await Questao.findAndCountAll({
      where,
      include: [
        { model: Disciplina, as: 'disciplina', attributes: ['id', 'nome'] },
        { model: Assunto, as: 'assunto', attributes: ['id', 'nome'] },
        { model: Banca, as: 'banca', attributes: ['id', 'nome'] },
        { model: Orgao, as: 'orgao', attributes: ['id', 'nome'] }
      ],
      order: [['id', 'DESC']],
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

router.post('/questoes', [
  body('enunciado').trim().notEmpty().withMessage('Enunciado é obrigatório'),
  body('alternativa_a').trim().notEmpty().withMessage('Alternativa A é obrigatória'),
  body('alternativa_b').trim().notEmpty().withMessage('Alternativa B é obrigatória'),
  body('alternativa_c').trim().notEmpty().withMessage('Alternativa C é obrigatória'),
  body('alternativa_d').trim().notEmpty().withMessage('Alternativa D é obrigatória'),
  body('gabarito').isIn(['A', 'B', 'C', 'D', 'E']).withMessage('Gabarito deve ser A, B, C, D ou E'),
  body('tipo').isIn(['MULTIPLA_ESCOLHA', 'CERTO_ERRADO']).withMessage('Tipo deve ser MULTIPLA_ESCOLHA ou CERTO_ERRADO'),
  body('ano').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Ano inválido'),
  body('disciplina_id').isInt().withMessage('Disciplina é obrigatória'),
  body('assunto_id').isInt().withMessage('Assunto é obrigatório'),
  body('banca_id').isInt().withMessage('Banca é obrigatória'),
  body('orgao_id').isInt().withMessage('Órgão é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const {
      enunciado,
      alternativa_a,
      alternativa_b,
      alternativa_c,
      alternativa_d,
      alternativa_e,
      gabarito,
      ano,
      disciplina_id,
      assunto_id,
      banca_id,
      orgao_id,
      comentario_professor
    } = req.body;

    // Verificar se as entidades relacionadas existem
    const [disciplina, assunto, banca, orgao] = await Promise.all([
      Disciplina.findByPk(disciplina_id),
      Assunto.findByPk(assunto_id),
      Banca.findByPk(banca_id),
      Orgao.findByPk(orgao_id)
    ]);

    if (!disciplina || !assunto || !banca || !orgao) {
      return res.status(404).json({
        error: 'Entidade não encontrada',
        message: 'Uma ou mais entidades relacionadas não foram encontradas'
      });
    }

    const questao = await Questao.create({
      enunciado: enunciado.trim(),
      alternativa_a: alternativa_a.trim(),
      alternativa_b: alternativa_b.trim(),
      alternativa_c: alternativa_c.trim(),
      alternativa_d: alternativa_d.trim(),
      alternativa_e: alternativa_e?.trim() || null,
      gabarito,
      tipo: tipo || 'MULTIPLA_ESCOLHA',
      ano: parseInt(ano),
      disciplina_id,
      assunto_id,
      banca_id,
      orgao_id,
      comentario_professor: comentario_professor?.trim() || null
    });

    res.status(201).json({
      success: true,
      message: 'Questão criada com sucesso!',
      questao
    });

  } catch (error) {
    console.error('Erro ao criar questão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar questão'
    });
  }
});

// Gerenciamento de Usuários
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await User.findAll({
      where: { tipo_usuario: 'aluno' },
      attributes: [
        'id', 'nome', 'email', 'status', 'xp', 'questoes_respondidas',
        'ultimo_login', 'created_at'
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ usuarios });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar usuários'
    });
  }
});

router.post('/usuarios', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, email, senha } = req.body;

    // Verificar se email já existe
    const usuarioExistente = await User.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Email já cadastrado',
        message: 'Este email já está sendo usado por outro usuário'
      });
    }

    const usuario = await User.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: await bcrypt.hash(senha, 10),
      tipo_usuario: 'aluno',
      status: 'gratuito'
    });

    // Log de auditoria
    auditLog('CREATE_USER', req.user.id, 'User', {
      createdUserId: usuario.id,
      createdUserEmail: usuario.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        status: usuario.status
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar usuário'
    });
  }
});

router.put('/usuarios/:id', [
  body('nome').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('status').optional().isIn(['gratuito', 'premium', 'suspenso']).withMessage('Status inválido')
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
    const { nome, email, status } = req.body;

    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== usuario.email) {
      const usuarioExistente = await User.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({
          error: 'Email já cadastrado',
          message: 'Este email já está sendo usado por outro usuário'
        });
      }
    }

    await usuario.update({
      nome: nome ? nome.trim() : usuario.nome,
      email: email ? email.toLowerCase().trim() : usuario.email,
      status: status || usuario.status
    });

    res.json({
      message: 'Usuário atualizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        status: usuario.status
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar usuário'
    });
  }
});

// Buscar questão específica
router.get('/questoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const questao = await Questao.findByPk(id, {
      include: [
        { model: Disciplina, as: 'disciplina', attributes: ['id', 'nome'] },
        { model: Assunto, as: 'assunto', attributes: ['id', 'nome'] },
        { model: Banca, as: 'banca', attributes: ['id', 'nome'] },
        { model: Orgao, as: 'orgao', attributes: ['id', 'nome'] }
      ]
    });
    
    if (!questao) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      });
    }
    
    res.json({
      success: true,
      questao
    });
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar questão'
    });
  }
});

// Excluir questão
router.delete('/questoes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const questao = await Questao.findByPk(id);
    if (!questao) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      });
    }

    await questao.destroy();

    res.json({
      success: true,
      message: 'Questão excluída com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao excluir questão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir questão'
    });
  }
});

// Atualizar questão
router.put('/questoes/:id', [
  body('enunciado').trim().notEmpty().withMessage('Enunciado é obrigatório'),
  body('alternativa_a').trim().notEmpty().withMessage('Alternativa A é obrigatória'),
  body('alternativa_b').trim().notEmpty().withMessage('Alternativa B é obrigatória'),
  body('alternativa_c').trim().notEmpty().withMessage('Alternativa C é obrigatória'),
  body('alternativa_d').trim().notEmpty().withMessage('Alternativa D é obrigatória'),
  body('gabarito').isIn(['A', 'B', 'C', 'D', 'E']).withMessage('Gabarito deve ser A, B, C, D ou E'),
  body('ano').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Ano inválido'),
  body('disciplina_id').isInt().withMessage('Disciplina é obrigatória'),
  body('assunto_id').isInt().withMessage('Assunto é obrigatório'),
  body('banca_id').isInt().withMessage('Banca é obrigatória'),
  body('orgao_id').isInt().withMessage('Órgão é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const {
      enunciado,
      alternativa_a,
      alternativa_b,
      alternativa_c,
      alternativa_d,
      alternativa_e,
      gabarito,
      ano,
      disciplina_id,
      assunto_id,
      banca_id,
      orgao_id,
      comentario_professor
    } = req.body;

    const questao = await Questao.findByPk(id);
    if (!questao) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      });
    }

    // Verificar se as entidades relacionadas existem
    const [disciplina, assunto, banca, orgao] = await Promise.all([
      Disciplina.findByPk(disciplina_id),
      Assunto.findByPk(assunto_id),
      Banca.findByPk(banca_id),
      Orgao.findByPk(orgao_id)
    ]);

    if (!disciplina || !assunto || !banca || !orgao) {
      return res.status(404).json({
        success: false,
        message: 'Uma ou mais entidades relacionadas não foram encontradas'
      });
    }

    await questao.update({
      enunciado: enunciado.trim(),
      alternativa_a: alternativa_a.trim(),
      alternativa_b: alternativa_b.trim(),
      alternativa_c: alternativa_c.trim(),
      alternativa_d: alternativa_d.trim(),
      alternativa_e: alternativa_e?.trim() || null,
      gabarito,
      ano: parseInt(ano),
      disciplina_id,
      assunto_id,
      banca_id,
      orgao_id,
      comentario_professor: comentario_professor?.trim() || null
    });

    res.json({
      success: true,
      message: 'Questão atualizada com sucesso!',
      questao
    });

  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar questão'
    });
  }
});

// Excluir questão
router.delete('/questoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const questao = await Questao.findByPk(id);
    if (!questao) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      });
    }
    
    await questao.destroy();
    
    res.json({
      success: true,
      message: 'Questão excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir questão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir questão'
    });
  }
});

// Gerenciamento de Comentários
router.get('/comentarios', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('aprovado').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { page = 1, limit = 10, aprovado } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (aprovado !== undefined) where.aprovado = aprovado;

    const comentarios = await ComentarioAluno.findAndCountAll({
      where,
      include: [
        { model: User, as: 'usuario', attributes: ['id', 'nome'] },
        { model: Questao, as: 'questao', attributes: ['id', 'enunciado'] }
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

router.put('/comentarios/:id/aprovar', async (req, res) => {
  try {
    const { id } = req.params;

    const comentario = await ComentarioAluno.findByPk(id);
    if (!comentario) {
      return res.status(404).json({
        error: 'Comentário não encontrado',
        message: 'Comentário não encontrado'
      });
    }

    await comentario.update({ aprovado: true });

    res.json({
      message: 'Comentário aprovado com sucesso!',
      comentario
    });

  } catch (error) {
    console.error('Erro ao aprovar comentário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao aprovar comentário'
    });
  }
});

// Gerenciamento de Branding
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Arquivo não fornecido',
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    // Salvar ou atualizar configuração do logo
    await ConfiguracaoPlataforma.upsert({
      chave: 'logo_url',
      valor: logoUrl,
      descricao: 'URL do logo da plataforma'
    });

    res.json({
      message: 'Logo atualizado com sucesso!',
      logoUrl
    });

  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao fazer upload do logo'
    });
  }
});

router.get('/configuracoes', async (req, res) => {
  try {
    const configuracoes = await ConfiguracaoPlataforma.findAll();
    
    const configObj = {};
    configuracoes.forEach(config => {
      configObj[config.chave] = config.valor;
    });

    res.json({
      success: true,
      configuracoes: configObj
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configurações'
    });
  }
});

// Atualizar configurações
router.put('/configuracoes', async (req, res) => {
  try {
    const { nome_plataforma, email_contato, limite_gratuito, xp_acerto } = req.body;

    // Atualizar configurações uma a uma
    await Promise.all([
      ConfiguracaoPlataforma.upsert({
        chave: 'nome_plataforma',
        valor: nome_plataforma,
        descricao: 'Nome da plataforma'
      }),
      ConfiguracaoPlataforma.upsert({
        chave: 'email_contato',
        valor: email_contato,
        descricao: 'E-mail de contato'
      }),
      ConfiguracaoPlataforma.upsert({
        chave: 'limite_gratuito',
        valor: limite_gratuito.toString(),
        descricao: 'Limite de questões para usuários gratuitos'
      }),
      ConfiguracaoPlataforma.upsert({
        chave: 'xp_acerto',
        valor: xp_acerto.toString(),
        descricao: 'XP ganho por acerto'
      })
    ]);

    res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configurações'
    });
  }
});

// Gerenciamento de Planos
// Listar todos os planos
router.get('/planos', async (req, res) => {
  try {
    const planos = await PlanoAssinatura.findAll({
      order: [['id', 'ASC']]
    });
    
    res.json(planos);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar planos'
    });
  }
});

// Buscar plano específico
router.get('/planos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const plano = await PlanoAssinatura.findByPk(id);
    
    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }
    
    res.json({
      success: true,
      plano
    });
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar plano'
    });
  }
});

// Criar novo plano
router.post('/planos', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser um valor válido'),
  body('recorrencia').isIn(['mensal', 'anual']).withMessage('Recorrência deve ser mensal ou anual'),
  body('descricao').optional().trim(),
  body('beneficios').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, preco, recorrencia, descricao, beneficios, ativo = true } = req.body;

    const plano = await PlanoAssinatura.create({
      nome: nome.trim(),
      preco: parseFloat(preco),
      recorrencia,
      descricao: descricao?.trim() || null,
      beneficios: beneficios?.trim() || null,
      ativo
    });

    res.status(201).json({
      success: true,
      message: 'Plano criado com sucesso!',
      plano
    });

  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar plano'
    });
  }
});

// Atualizar plano
router.put('/planos/:id', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser um valor válido'),
  body('recorrencia').isIn(['mensal', 'anual']).withMessage('Recorrência deve ser mensal ou anual'),
  body('descricao').optional().trim(),
  body('beneficios').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { nome, preco, recorrencia, descricao, beneficios } = req.body;

    const plano = await PlanoAssinatura.findByPk(id);
    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    await plano.update({
      nome: nome.trim(),
      preco: parseFloat(preco),
      recorrencia,
      descricao: descricao?.trim() || null,
      beneficios: beneficios?.trim() || null
    });

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso!',
      plano
    });

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar plano'
    });
  }
});

// Alternar status do plano
router.put('/planos/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const plano = await PlanoAssinatura.findByPk(id);
    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    await plano.update({ ativo: status === 'ativo' });

    res.json({
      success: true,
      message: `Plano ${status === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`,
      plano
    });

  } catch (error) {
    console.error('Erro ao alternar status do plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alternar status do plano'
    });
  }
});

// Excluir plano
router.delete('/planos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const plano = await PlanoAssinatura.findByPk(id);
    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    await plano.destroy();

    res.json({
      success: true,
      message: 'Plano excluído com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao excluir plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir plano'
    });
  }
});

// Atualizar plano
router.put('/planos/:id', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser um valor válido'),
  body('recorrencia').isIn(['mensal', 'anual']).withMessage('Recorrência deve ser mensal ou anual'),
  body('descricao').optional().trim(),
  body('beneficios').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { nome, preco, recorrencia, descricao, beneficios, ativo = true } = req.body;

    const plano = await PlanoAssinatura.findByPk(id);
    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    await plano.update({
      nome: nome.trim(),
      preco: parseFloat(preco),
      recorrencia,
      descricao: descricao?.trim() || null,
      beneficios: beneficios?.trim() || null,
      ativo
    });

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso!',
      plano
    });

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar plano'
    });
  }
});

// Excluir plano
router.delete('/planos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const plano = await PlanoAssinatura.findByPk(id);
    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }
    
    await plano.destroy();
    
    res.json({
      success: true,
      message: 'Plano excluído com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir plano:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir plano'
    });
  }
});

// ===== ROTAS PARA GERENCIAMENTO DE COMENTÁRIOS =====

// GET /api/admin/comentarios - Listar comentários para moderação
router.get('/comentarios', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('status').optional().isIn(['pendente', 'aprovado', 'rejeitado']).withMessage('Status inválido'),
  query('tipo').optional().isIn(['DUVIDA', 'SUGESTAO', 'ERRO', 'ELOGIO', 'GERAL']).withMessage('Tipo inválido')
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, tipo } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status === 'pendente') where.aprovado = false;
    else if (status === 'aprovado') where.aprovado = true;
    else if (status === 'rejeitado') where.aprovado = false;
    
    if (tipo) where.tipo = tipo;

    const comentarios = await ComentarioAluno.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        },
        {
          model: Questao,
          as: 'questao',
          attributes: ['id', 'enunciado']
        }
      ],
      order: [['data_criacao', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      comentarios: comentarios.rows,
      total: comentarios.count,
      page: parseInt(page),
      totalPages: Math.ceil(comentarios.count / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar comentários'
    });
  }
});

// PUT /api/admin/comentarios/:id/aprovar - Aprovar comentário
router.put('/comentarios/:id/aprovar', [
  body('resposta_admin').optional().trim().isLength({ max: 1000 }).withMessage('Resposta deve ter no máximo 1000 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { resposta_admin } = req.body;

    const comentario = await ComentarioAluno.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    if (!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentário não encontrado'
      });
    }

    await comentario.update({
      aprovado: true,
      respondido: !!resposta_admin,
      resposta_admin: resposta_admin || null,
      data_resposta: resposta_admin ? new Date() : null
    });

    // Log de auditoria
    auditLog('APPROVE_COMMENT', req.user.id, 'ComentarioAluno', {
      comentarioId: comentario.id,
      questaoId: comentario.questao_id,
      usuarioId: comentario.usuario_id,
      respostaAdmin: !!resposta_admin,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Comentário aprovado com sucesso!',
      comentario
    });
  } catch (error) {
    console.error('Erro ao aprovar comentário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar comentário'
    });
  }
});

// PUT /api/admin/comentarios/:id/rejeitar - Rejeitar comentário
router.put('/comentarios/:id/rejeitar', [
  body('motivo').optional().trim().isLength({ max: 500 }).withMessage('Motivo deve ter no máximo 500 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { motivo } = req.body;

    const comentario = await ComentarioAluno.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    if (!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentário não encontrado'
      });
    }

    // Marcar como rejeitado (não aprovado) e adicionar motivo se fornecido
    await comentario.update({
      aprovado: false,
      resposta_admin: motivo || 'Comentário rejeitado pelo administrador'
    });

    // Log de auditoria
    auditLog('REJECT_COMMENT', req.user.id, 'ComentarioAluno', {
      comentarioId: comentario.id,
      questaoId: comentario.questao_id,
      usuarioId: comentario.usuario_id,
      motivo,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Comentário rejeitado com sucesso!',
      comentario
    });
  } catch (error) {
    console.error('Erro ao rejeitar comentário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao rejeitar comentário'
    });
  }
});

// DELETE /api/admin/comentarios/:id - Excluir comentário
router.delete('/comentarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const comentario = await ComentarioAluno.findByPk(id);
    if (!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentário não encontrado'
      });
    }

    await comentario.destroy();

    // Log de auditoria
    auditLog('DELETE_COMMENT_ADMIN', req.user.id, 'ComentarioAluno', {
      comentarioId: id,
      questaoId: comentario.questao_id,
      usuarioId: comentario.usuario_id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Comentário excluído com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir comentário'
    });
  }
});

// PUT /api/admin/comentarios/:id/responder - Responder a um comentário
router.put('/comentarios/:id/responder', [
  body('resposta_admin').trim().isLength({ min: 1, max: 1000 }).withMessage('Resposta deve ter entre 1 e 1000 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { resposta_admin } = req.body;

    const comentario = await ComentarioAluno.findByPk(id);
    if (!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentário não encontrado'
      });
    }

    await comentario.update({
      respondido: true,
      resposta_admin: resposta_admin.trim(),
      data_resposta: new Date()
    });

    // Log de auditoria
    auditLog('RESPOND_COMMENT', req.user.id, 'ComentarioAluno', {
      comentarioId: comentario.id,
      questaoId: comentario.questao_id,
      usuarioId: comentario.usuario_id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Resposta enviada com sucesso!',
      comentario
    });
  } catch (error) {
    console.error('Erro ao responder comentário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao responder comentário'
    });
  }
});

module.exports = router;
