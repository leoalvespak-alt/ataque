const express = require('express');
const { PlanoAssinatura, AssinaturaUsuario, User } = require('../models');
const axios = require('axios');

const router = express.Router();

// Buscar planos disponíveis
router.get('/planos', async (req, res) => {
  try {
    const planos = await PlanoAssinatura.findAll({
      where: { ativo: true },
      attributes: ['id', 'nome', 'preco', 'recorrencia', 'descricao', 'beneficios'],
      order: [['preco', 'ASC']]
    });

    res.json({ planos });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar planos'
    });
  }
});

// Buscar assinatura ativa do usuário
router.get('/minha-assinatura', async (req, res) => {
  try {
    const userId = req.user.id;

    const assinatura = await AssinaturaUsuario.findOne({
      where: {
        usuario_id: userId,
        status: 'ativa'
      },
      include: [
        { model: PlanoAssinatura, as: 'plano' }
      ],
      order: [['data_expiracao', 'DESC']]
    });

    res.json({ assinatura });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar assinatura'
    });
  }
});

// Criar assinatura (integração com Asaas)
router.post('/criar-assinatura', async (req, res) => {
  try {
    const userId = req.user.id;
    const { plano_id, customer_id } = req.body;

    // Verificar se plano existe
    const plano = await PlanoAssinatura.findByPk(plano_id);
    if (!plano || !plano.ativo) {
      return res.status(404).json({
        error: 'Plano não encontrado',
        message: 'O plano selecionado não está disponível'
      });
    }

    // Verificar se usuário já tem assinatura ativa
    const assinaturaExistente = await AssinaturaUsuario.findOne({
      where: {
        usuario_id: userId,
        status: 'ativa'
      }
    });

    if (assinaturaExistente) {
      return res.status(400).json({
        error: 'Assinatura ativa',
        message: 'Você já possui uma assinatura ativa'
      });
    }

    // Calcular data de expiração
    const dataInicio = new Date();
    const dataExpiracao = new Date();
    if (plano.recorrencia === 'mensal') {
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
    } else {
      dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
    }

    // Criar assinatura no banco
    const assinatura = await AssinaturaUsuario.create({
      usuario_id: userId,
      plano_id: plano_id,
      data_inicio: dataInicio,
      data_expiracao: dataExpiracao,
      valor_pago: plano.preco,
      status: 'ativa'
    });

    // Atualizar status do usuário para premium
    await User.update(
      { status: 'premium' },
      { where: { id: userId } }
    );

    res.status(201).json({
      message: 'Assinatura criada com sucesso!',
      assinatura: {
        id: assinatura.id,
        plano: plano.nome,
        data_inicio: assinatura.data_inicio,
        data_expiracao: assinatura.data_expiracao,
        valor_pago: assinatura.valor_pago
      }
    });

  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar assinatura'
    });
  }
});

// Cancelar assinatura
router.post('/cancelar-assinatura', async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar assinatura ativa
    const assinatura = await AssinaturaUsuario.findOne({
      where: {
        usuario_id: userId,
        status: 'ativa'
      }
    });

    if (!assinatura) {
      return res.status(404).json({
        error: 'Assinatura não encontrada',
        message: 'Você não possui uma assinatura ativa'
      });
    }

    // Cancelar assinatura
    await assinatura.update({ status: 'cancelada' });

    // Atualizar status do usuário para gratuito
    await User.update(
      { status: 'gratuito' },
      { where: { id: userId } }
    );

    res.json({
      message: 'Assinatura cancelada com sucesso!',
      assinatura: {
        id: assinatura.id,
        status: 'cancelada',
        data_cancelamento: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao cancelar assinatura'
    });
  }
});

// Webhook do Asaas (para receber notificações de pagamento)
router.post('/webhook-asaas', async (req, res) => {
  try {
    const { event, payment, subscription } = req.body;

    console.log('Webhook Asaas recebido:', { event, payment, subscription });

    // Verificar se é um evento de pagamento confirmado
    if (event === 'PAYMENT_RECEIVED' && payment) {
      // Atualizar status da assinatura se necessário
      if (subscription) {
        const assinatura = await AssinaturaUsuario.findOne({
          where: { asaas_subscription_id: subscription.id }
        });

        if (assinatura) {
          await assinatura.update({
            status: 'ativa',
            proxima_cobranca: subscription.nextDueDate
          });
        }
      }
    }

    // Verificar se é um evento de assinatura cancelada
    if (event === 'SUBSCRIPTION_CANCELLED' && subscription) {
      const assinatura = await AssinaturaUsuario.findOne({
        where: { asaas_subscription_id: subscription.id }
      });

      if (assinatura) {
        await assinatura.update({ status: 'cancelada' });
        
        // Atualizar status do usuário
        await User.update(
          { status: 'gratuito' },
          { where: { id: assinatura.usuario_id } }
        );
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook Asaas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
