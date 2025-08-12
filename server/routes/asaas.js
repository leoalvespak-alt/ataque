const express = require('express');
const axios = require('axios');
const { PlanoAssinatura, AssinaturaUsuario, User } = require('../models');

const router = express.Router();

// Configuração da API do Asaas
const asaasConfig = {
  baseURL: process.env.ASAAS_ENVIRONMENT === 'production' 
    ? 'https://api.asaas.com/v3' 
    : 'https://sandbox.asaas.com/api/v3',
  headers: {
    'access_token': process.env.ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
};

// Criar cliente no Asaas
router.post('/criar-cliente', async (req, res) => {
  try {
    const { nome, email, cpf, telefone } = req.body;

    const clienteData = {
      name: nome,
      email: email,
      phone: telefone,
      mobilePhone: telefone,
      cpfCnpj: cpf,
      postalCode: '00000-000', // Pode ser atualizado depois
      address: 'Endereço não informado', // Pode ser atualizado depois
      addressNumber: '0',
      complement: '',
      province: '',
      city: 'Cidade não informada',
      state: 'SP'
    };

    const response = await axios.post('/customers', clienteData, asaasConfig);

    res.json({
      message: 'Cliente criado com sucesso no Asaas!',
      customer: response.data
    });

  } catch (error) {
    console.error('Erro ao criar cliente no Asaas:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao criar cliente',
      message: 'Erro ao criar cliente no sistema de pagamento'
    });
  }
});

// Criar assinatura no Asaas
router.post('/criar-assinatura', async (req, res) => {
  try {
    const { customer_id, plano_id } = req.body;

    // Buscar plano
    const plano = await PlanoAssinatura.findByPk(plano_id);
    if (!plano || !plano.ativo) {
      return res.status(404).json({
        error: 'Plano não encontrado',
        message: 'O plano selecionado não está disponível'
      });
    }

    // Verificar se já existe um plano no Asaas
    let asaasPlanId = plano.asaas_plan_id;

    if (!asaasPlanId) {
      // Criar plano no Asaas
      const planData = {
        name: plano.nome,
        description: plano.descricao || `Plano ${plano.nome}`,
        billingType: 'CREDIT_CARD',
        value: parseFloat(plano.preco),
        dueDateLimitDays: 0,
        endDate: null,
        fine: {
          value: 2.00
        },
        interest: {
          value: 1.00
        },
        discount: {
          value: 0,
          dueDateLimitDays: 0
        },
        cycle: plano.recorrencia === 'mensal' ? 'MONTHLY' : 'YEARLY'
      };

      const planResponse = await axios.post('/plans', planData, asaasConfig);
      asaasPlanId = planResponse.data.id;

      // Atualizar plano no banco
      await plano.update({ asaas_plan_id: asaasPlanId });
    }

    // Criar assinatura no Asaas
    const subscriptionData = {
      customer: customer_id,
      billingType: 'CREDIT_CARD',
      value: parseFloat(plano.preco),
      nextDueDate: new Date().toISOString().split('T')[0], // Data de hoje
      cycle: plano.recorrencia === 'mensal' ? 'MONTHLY' : 'YEARLY',
      description: `Assinatura ${plano.nome}`,
      endDate: null,
      maxPayments: null,
      fine: {
        value: 2.00
      },
      interest: {
        value: 1.00
      }
    };

    const subscriptionResponse = await axios.post('/subscriptions', subscriptionData, asaasConfig);

    res.json({
      message: 'Assinatura criada com sucesso no Asaas!',
      subscription: subscriptionResponse.data
    });

  } catch (error) {
    console.error('Erro ao criar assinatura no Asaas:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao criar assinatura',
      message: 'Erro ao criar assinatura no sistema de pagamento'
    });
  }
});

// Gerar link de pagamento
router.post('/gerar-link-pagamento', async (req, res) => {
  try {
    const { customer_id, plano_id, valor } = req.body;

    const paymentData = {
      customer: customer_id,
      billingType: 'CREDIT_CARD',
      value: parseFloat(valor),
      dueDate: new Date().toISOString().split('T')[0],
      description: 'Pagamento Rota de Ataque Questões',
      externalReference: `pag_${Date.now()}`,
      discount: {
        value: 0,
        dueDateLimitDays: 0
      },
      fine: {
        value: 2.00
      },
      interest: {
        value: 1.00
      },
      postalService: false
    };

    const response = await axios.post('/payments', paymentData, asaasConfig);

    res.json({
      message: 'Link de pagamento gerado com sucesso!',
      payment: response.data
    });

  } catch (error) {
    console.error('Erro ao gerar link de pagamento:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao gerar link de pagamento',
      message: 'Erro ao gerar link de pagamento'
    });
  }
});

// Consultar status de pagamento
router.get('/status-pagamento/:payment_id', async (req, res) => {
  try {
    const { payment_id } = req.params;

    const response = await axios.get(`/payments/${payment_id}`, asaasConfig);

    res.json({
      payment: response.data
    });

  } catch (error) {
    console.error('Erro ao consultar status do pagamento:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao consultar status',
      message: 'Erro ao consultar status do pagamento'
    });
  }
});

// Cancelar assinatura no Asaas
router.post('/cancelar-assinatura/:subscription_id', async (req, res) => {
  try {
    const { subscription_id } = req.params;

    const response = await axios.post(`/subscriptions/${subscription_id}/cancel`, {}, asaasConfig);

    res.json({
      message: 'Assinatura cancelada com sucesso no Asaas!',
      subscription: response.data
    });

  } catch (error) {
    console.error('Erro ao cancelar assinatura no Asaas:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao cancelar assinatura',
      message: 'Erro ao cancelar assinatura no sistema de pagamento'
    });
  }
});

// Webhook para receber notificações do Asaas
router.post('/webhook', async (req, res) => {
  try {
    const { event, payment, subscription } = req.body;

    console.log('Webhook Asaas recebido:', { event, payment, subscription });

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'PAYMENT_RECEIVED':
        if (payment && payment.status === 'RECEIVED') {
          // Atualizar status do pagamento
          console.log('Pagamento recebido:', payment.id);
        }
        break;

      case 'PAYMENT_CONFIRMED':
        if (payment && payment.status === 'CONFIRMED') {
          // Pagamento confirmado
          console.log('Pagamento confirmado:', payment.id);
        }
        break;

      case 'PAYMENT_OVERDUE':
        if (payment && payment.status === 'OVERDUE') {
          // Pagamento em atraso
          console.log('Pagamento em atraso:', payment.id);
        }
        break;

      case 'SUBSCRIPTION_CREATED':
        if (subscription) {
          console.log('Assinatura criada:', subscription.id);
        }
        break;

      case 'SUBSCRIPTION_CANCELLED':
        if (subscription) {
          // Cancelar assinatura no banco
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

            console.log('Assinatura cancelada no banco:', assinatura.id);
          }
        }
        break;

      default:
        console.log('Evento não processado:', event);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Erro no webhook Asaas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
