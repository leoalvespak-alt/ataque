const express = require('express');
const { authenticateToken, requireGestor } = require('../middleware/auth');
const { Patente, User } = require('../models');

const router = express.Router();

// Listar todas as patentes (rota pública)
router.get('/public', async (req, res) => {
  try {
    const patentes = await Patente.findAll({
      where: { ativo: true },
      order: [['xp_necessario', 'ASC']]
    });

    res.json(patentes);

  } catch (error) {
    console.error('Erro ao listar patentes:', error);
    res.status(500).json({
      error: 'Erro ao listar patentes'
    });
  }
});

// Listar todas as patentes (requer gestor)
router.get('/', authenticateToken, requireGestor, async (req, res) => {
  try {
    const patentes = await Patente.findAll({
      where: { ativo: true },
      order: [['xp_necessario', 'ASC']]
    });

    res.json({
      success: true,
      patentes
    });

  } catch (error) {
    console.error('Erro ao listar patentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar patentes'
    });
  }
});

// Buscar patente por ID
router.get('/:id', authenticateToken, requireGestor, async (req, res) => {
  try {
    const patente = await Patente.findByPk(req.params.id);

    if (!patente) {
      return res.status(404).json({
        success: false,
        message: 'Patente não encontrada'
      });
    }

    res.json({
      success: true,
      patente
    });

  } catch (error) {
    console.error('Erro ao buscar patente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar patente'
    });
  }
});

// Criar nova patente
router.post('/', authenticateToken, requireGestor, async (req, res) => {
  try {
    const { nome, descricao, xp_necessario, icone, cor } = req.body;

    // Validações
    if (!nome || !xp_necessario) {
      return res.status(400).json({
        success: false,
        message: 'Nome e XP necessário são obrigatórios'
      });
    }

    // Verificar se já existe uma patente com o mesmo nome
    const patenteExistente = await Patente.findOne({
      where: { nome, ativo: true }
    });

    if (patenteExistente) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma patente com este nome'
      });
    }

    const patente = await Patente.create({
      nome,
      descricao,
      xp_necessario,
      icone,
      cor: cor || '#c1121f'
    });

    res.status(201).json({
      success: true,
      message: 'Patente criada com sucesso',
      patente
    });

  } catch (error) {
    console.error('Erro ao criar patente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar patente'
    });
  }
});

// Atualizar patente
router.put('/:id', authenticateToken, requireGestor, async (req, res) => {
  try {
    const { nome, descricao, xp_necessario, icone, cor } = req.body;

    const patente = await Patente.findByPk(req.params.id);

    if (!patente) {
      return res.status(404).json({
        success: false,
        message: 'Patente não encontrada'
      });
    }

    // Verificar se já existe outra patente com o mesmo nome
    if (nome && nome !== patente.nome) {
      const patenteExistente = await Patente.findOne({
        where: { nome, ativo: true, id: { [require('sequelize').Op.ne]: req.params.id } }
      });

      if (patenteExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma patente com este nome'
        });
      }
    }

    await patente.update({
      nome: nome || patente.nome,
      descricao: descricao !== undefined ? descricao : patente.descricao,
      xp_necessario: xp_necessario || patente.xp_necessario,
      icone: icone !== undefined ? icone : patente.icone,
      cor: cor || patente.cor
    });

    res.json({
      success: true,
      message: 'Patente atualizada com sucesso',
      patente
    });

  } catch (error) {
    console.error('Erro ao atualizar patente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar patente'
    });
  }
});

// Excluir patente (soft delete)
router.delete('/:id', authenticateToken, requireGestor, async (req, res) => {
  try {
    const patente = await Patente.findByPk(req.params.id);

    if (!patente) {
      return res.status(404).json({
        success: false,
        message: 'Patente não encontrada'
      });
    }

    // Verificar se há usuários usando esta patente
    const usuariosComPatente = await User.count({
      where: { patente_id: req.params.id }
    });

    if (usuariosComPatente > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível excluir esta patente. ${usuariosComPatente} usuário(s) possuem esta patente.`
      });
    }

    await patente.update({ ativo: false });

    res.json({
      success: true,
      message: 'Patente excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir patente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir patente'
    });
  }
});

// Função para verificar e atualizar patente do usuário
async function verificarEAtualizarPatente(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) return null;

    // Buscar patentes ordenadas por XP necessário (maior para menor)
    const patentes = await Patente.findAll({
      where: { ativo: true },
      order: [['xp_necessario', 'DESC']]
    });

    // Encontrar a patente adequada para o XP do usuário
    let novaPatente = null;
    for (const patente of patentes) {
      if (user.xp >= patente.xp_necessario) {
        novaPatente = patente;
        break;
      }
    }

    // Se encontrou uma nova patente e é diferente da atual
    if (novaPatente && user.patente_id !== novaPatente.id) {
      await user.update({ patente_id: novaPatente.id });
      return novaPatente;
    }

    return null;
  } catch (error) {
    console.error('Erro ao verificar patente:', error);
    return null;
  }
}

module.exports = { router, verificarEAtualizarPatente };
