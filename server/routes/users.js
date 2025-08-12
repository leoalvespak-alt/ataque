const express = require('express');
const { User, RespostaUsuario, Questao, AssinaturaUsuario, PlanoAssinatura } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Buscar dados do usuário logado
router.get('/me', async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'nome', 'email', 'status', 'xp', 'questoes_respondidas',
        'ultimo_login', 'created_at', 'profile_picture_url', 'tipo_usuario'
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar dados do usuário'
    });
  }
});

// Buscar perfil do usuário
router.get('/perfil', async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'nome', 'email', 'status', 'xp', 'questoes_respondidas',
        'ultimo_login', 'created_at'
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    // Buscar assinatura ativa
    const assinaturaAtiva = await AssinaturaUsuario.findOne({
      where: {
        usuario_id: userId,
        status: 'ativa'
      },
      include: [
        { model: PlanoAssinatura, as: 'plano', attributes: ['nome', 'recorrencia'] }
      ],
      order: [['data_expiracao', 'DESC']]
    });

    res.json({
      success: true,
      usuario: {
        ...user.toJSON(),
        assinatura_ativa: assinaturaAtiva ? {
          plano: {
            nome: assinaturaAtiva.plano.nome,
            recorrencia: assinaturaAtiva.plano.recorrencia,
            preco: assinaturaAtiva.plano.preco,
          },
          status: assinaturaAtiva.status,
          data_expiracao: assinaturaAtiva.data_expiracao,
          proxima_cobranca: assinaturaAtiva.proxima_cobranca,
          // Supondo que você tenha um campo no modelo AssinaturaUsuario para o link do ASAAS
          // Ou que você possa gerar isso aqui (idealmente, o link vem do ASAAS na criação)
          asaas_link_gerenciamento: `https://www.asaas.com/client/subscriptions/${assinaturaAtiva.asaas_subscription_id}` // Exemplo, ajuste conforme API Asaas
        } : null
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar perfil'
    });
  }
});

// Buscar estatísticas do usuário
router.get('/estatisticas', async (req, res) => {
  try {
    const userId = req.user.id;

    // Estatísticas gerais
    const totalRespostas = await RespostaUsuario.count({
      where: { usuario_id: userId }
    });

    const acertos = await RespostaUsuario.count({
      where: { 
        usuario_id: userId,
        acertou: true
      }
    });

    const erros = totalRespostas - acertos;
    const taxaAcerto = totalRespostas > 0 ? (acertos / totalRespostas * 100).toFixed(1) : 0;

    // Questões por disciplina
    const questoesPorDisciplina = await RespostaUsuario.findAll({
      where: { usuario_id: userId },
      include: [
        {
          model: Questao,
          as: 'questao',
          include: [
            { model: require('../models/Disciplina'), as: 'disciplina', attributes: ['nome'] }
          ]
        }
      ],
      attributes: ['acertou']
    });

    const disciplinaStats = {};
    questoesPorDisciplina.forEach(resposta => {
      const disciplina = resposta.questao.disciplina.nome;
      if (!disciplinaStats[disciplina]) {
        disciplinaStats[disciplina] = { total: 0, acertos: 0 };
      }
      disciplinaStats[disciplina].total++;
      if (resposta.acertou) disciplinaStats[disciplina].acertos++;
    });

    // Calcular taxa de acerto por disciplina
    Object.keys(disciplinaStats).forEach(disciplina => {
      const stats = disciplinaStats[disciplina];
      stats.taxaAcerto = stats.total > 0 ? (stats.acertos / stats.total * 100).toFixed(1) : 0;
    });

    // Últimas respostas
    const ultimasRespostas = await RespostaUsuario.findAll({
      where: { usuario_id: userId },
      include: [
        {
          model: Questao,
          as: 'questao',
          include: [
            { model: require('../models/Disciplina'), as: 'disciplina', attributes: ['nome'] }
          ]
        }
      ],
      attributes: ['alternativa_marcada', 'acertou', 'data_resposta'],
      order: [['data_resposta', 'DESC']],
      limit: 10
    });

    res.json({
      estatisticas: {
        totalRespostas,
        acertos,
        erros,
        taxaAcerto: parseFloat(taxaAcerto),
        questoesPorDisciplina: disciplinaStats
      },
      ultimasRespostas: ultimasRespostas.map(resposta => ({
        disciplina: resposta.questao.disciplina.nome,
        alternativa: resposta.alternativa_marcada,
        acertou: resposta.acertou,
        data: resposta.data_resposta
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar estatísticas'
    });
  }
});

// Buscar ranking
router.get('/ranking', async (req, res) => {
  try {
    const { tipo = 'geral', limit = 50 } = req.query;

    let whereClause = {};
    let orderClause = [['xp', 'DESC'], ['nome', 'ASC']];

    // Filtrar por período
    if (tipo === 'semanal') {
      const umaSemanaAtras = new Date();
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
      whereClause.ultimo_login = { [Op.gte]: umaSemanaAtras };
    } else if (tipo === 'mensal') {
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);
      whereClause.ultimo_login = { [Op.gte]: umMesAtras };
    }

    const ranking = await User.findAll({
      where: {
        ...whereClause,
        ativo: true,
        tipo_usuario: 'aluno'
      },
      attributes: ['id', 'nome', 'xp', 'status'],
      order: orderClause,
      limit: parseInt(limit)
    });

    // Adicionar posição no ranking
    const rankingComPosicao = ranking.map((user, index) => ({
      posicao: index + 1,
      id: user.id,
      nome: user.nome,
      xp: user.xp,
      status: user.status
    }));

    res.json({
      tipo,
      ranking: rankingComPosicao
    });

  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar ranking'
    });
  }
});

// Atualizar perfil do usuário
router.put('/perfil', async (req, res) => {
  try {
    const userId = req.user.id;
    const { nome } = req.body;

    if (!nome || nome.trim().length < 2) {
      return res.status(400).json({
        error: 'Nome inválido',
        message: 'Nome deve ter pelo menos 2 caracteres'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    await user.update({ nome: nome.trim() });

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        status: user.status,
        xp: user.xp
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar perfil'
    });
  }
});

// Alterar senha do usuário
router.put('/senha', async (req, res) => {
  try {
    const userId = req.user.id;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const bcrypt = require('bcrypt');
    const senhaCorreta = await bcrypt.compare(senhaAtual, user.hash_senha);
    
    if (!senhaCorreta) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const novoHash = await bcrypt.hash(novaSenha, 12);

    // Atualizar senha
    await user.update({ hash_senha: novoHash });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha'
    });
  }
});

module.exports = router;
