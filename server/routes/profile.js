const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { auditLog } = require('../utils/logger');

const router = express.Router();

// Middleware para verificar se o usuário está autenticado
router.use(authenticateToken);

// Buscar dados do perfil do usuário
router.get('/me', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['hash_senha'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar dados do perfil
router.put('/me', [
  body('nome').optional().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('telefone').optional().isLength({ min: 10, max: 15 }).withMessage('Telefone inválido'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio deve ter no máximo 500 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se o email já existe (se foi alterado)
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: req.body.email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
    }

    // Atualizar dados
    const updateData = {};
    if (req.body.nome) updateData.nome = req.body.nome;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.telefone) updateData.telefone = req.body.telefone;
    if (req.body.bio) updateData.bio = req.body.bio;

    await user.update(updateData);

    // Log da ação
    auditLog('PROFILE_UPDATE', `Usuário ${user.id} atualizou perfil`, {
      userId: user.id,
      updatedFields: Object.keys(updateData)
    });

    res.json({ 
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        bio: user.bio,
        tipo_usuario: user.tipo_usuario,
        status: user.status,
        xp: user.xp,
        questoes_respondidas: user.questoes_respondidas
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Alterar senha
router.put('/change-password', [
  body('senha_atual').notEmpty().withMessage('Senha atual é obrigatória'),
  body('nova_senha').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(req.body.senha_atual, user.hash_senha);
    if (!senhaValida) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(req.body.nova_senha, 12);

    // Atualizar senha
    await user.update({ hash_senha: novaSenhaHash });

    // Log da ação
    auditLog('PASSWORD_CHANGE', `Usuário ${user.id} alterou senha`, {
      userId: user.id
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Exportar dados do usuário
router.get('/export-data', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['hash_senha'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Aqui você pode adicionar mais dados como histórico de questões, etc.
    const userData = {
      perfil: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        bio: user.bio,
        tipo_usuario: user.tipo_usuario,
        status: user.status,
        xp: user.xp,
        questoes_respondidas: user.questoes_respondidas,
        data_criacao: user.createdAt,
        ultima_atualizacao: user.updatedAt
      },
      estatisticas: {
        total_questoes_respondidas: user.questoes_respondidas,
        nivel_xp: user.xp,
        status_conta: user.status
      },
      exportado_em: new Date().toISOString()
    };

    // Log da ação
    auditLog('DATA_EXPORT', `Usuário ${user.id} exportou dados`, {
      userId: user.id
    });

    res.json(userData);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Configurações de privacidade
router.get('/privacy-settings', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Configurações padrão (você pode adicionar campos específicos na tabela User)
    const privacySettings = {
      perfil_publico: user.perfil_publico || false,
      mostrar_email: user.mostrar_email || false,
      mostrar_telefone: user.mostrar_telefone || false,
      mostrar_estatisticas: user.mostrar_estatisticas || true,
      receber_notificacoes: user.receber_notificacoes || true,
      receber_emails: user.receber_emails || true
    };

    res.json({ privacySettings });
  } catch (error) {
    console.error('Erro ao buscar configurações de privacidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configurações de privacidade
router.put('/privacy-settings', [
  body('perfil_publico').optional().isBoolean().withMessage('perfil_publico deve ser true ou false'),
  body('mostrar_email').optional().isBoolean().withMessage('mostrar_email deve ser true ou false'),
  body('mostrar_telefone').optional().isBoolean().withMessage('mostrar_telefone deve ser true ou false'),
  body('mostrar_estatisticas').optional().isBoolean().withMessage('mostrar_estatisticas deve ser true ou false'),
  body('receber_notificacoes').optional().isBoolean().withMessage('receber_notificacoes deve ser true ou false'),
  body('receber_emails').optional().isBoolean().withMessage('receber_emails deve ser true ou false')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar configurações
    const updateData = {};
    if (req.body.perfil_publico !== undefined) updateData.perfil_publico = req.body.perfil_publico;
    if (req.body.mostrar_email !== undefined) updateData.mostrar_email = req.body.mostrar_email;
    if (req.body.mostrar_telefone !== undefined) updateData.mostrar_telefone = req.body.mostrar_telefone;
    if (req.body.mostrar_estatisticas !== undefined) updateData.mostrar_estatisticas = req.body.mostrar_estatisticas;
    if (req.body.receber_notificacoes !== undefined) updateData.receber_notificacoes = req.body.receber_notificacoes;
    if (req.body.receber_emails !== undefined) updateData.receber_emails = req.body.receber_emails;

    await user.update(updateData);

    // Log da ação
    auditLog('PRIVACY_UPDATE', `Usuário ${user.id} atualizou configurações de privacidade`, {
      userId: user.id,
      updatedSettings: Object.keys(updateData)
    });

    res.json({ 
      message: 'Configurações de privacidade atualizadas com sucesso',
      privacySettings: {
        perfil_publico: user.perfil_publico,
        mostrar_email: user.mostrar_email,
        mostrar_telefone: user.mostrar_telefone,
        mostrar_estatisticas: user.mostrar_estatisticas,
        receber_notificacoes: user.receber_notificacoes,
        receber_emails: user.receber_emails
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações de privacidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir conta
router.delete('/delete-account', [
  body('senha').notEmpty().withMessage('Senha é obrigatória para confirmar exclusão')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(req.body.senha, user.hash_senha);
    if (!senhaValida) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    // Log da ação antes de deletar
    auditLog('ACCOUNT_DELETE', `Usuário ${user.id} excluiu conta`, {
      userId: user.id,
      userEmail: user.email
    });

    // Excluir usuário
    await user.destroy();

    res.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
