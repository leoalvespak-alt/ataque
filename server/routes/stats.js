const express = require('express');
const { authenticateToken, requireGestor } = require('../middleware/auth');
const { User, Questao, RespostaUsuario, Disciplina, Assunto } = require('../models');
const { sequelize } = require('../config/database');

const router = express.Router();

// Rota para o aluno ver suas próprias estatísticas
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar todas as respostas do usuário
    const respostas = await RespostaUsuario.findAll({
      where: { usuario_id: userId },
      include: [
        {
          model: Questao,
          as: 'questao',
          include: [
            { model: Disciplina, as: 'disciplina', attributes: ['id', 'nome'] },
            { model: Assunto, as: 'assunto', attributes: ['id', 'nome'] }
          ]
        }
      ],
      order: [['data_resposta', 'DESC']]
    });

    // Calcular estatísticas gerais
    const totalRespostas = respostas.length;
    const acertos = respostas.filter(r => r.acertou).length;
    const erros = totalRespostas - acertos;
    const percentualAcerto = totalRespostas > 0 ? (acertos / totalRespostas) * 100 : 0;

    // Calcular estatísticas por disciplina
    const statsPorDisciplina = {};
    respostas.forEach(resposta => {
      const disciplina = resposta.questao.disciplina;
      if (!statsPorDisciplina[disciplina.id]) {
        statsPorDisciplina[disciplina.id] = {
          id: disciplina.id,
          nome: disciplina.nome,
          total: 0,
          acertos: 0,
          erros: 0,
          percentual: 0
        };
      }
      
      statsPorDisciplina[disciplina.id].total++;
      if (resposta.acertou) {
        statsPorDisciplina[disciplina.id].acertos++;
      } else {
        statsPorDisciplina[disciplina.id].erros++;
      }
    });

    // Calcular percentual por disciplina
    Object.values(statsPorDisciplina).forEach(stats => {
      stats.percentual = stats.total > 0 ? (stats.acertos / stats.total) * 100 : 0;
    });

    // Calcular estatísticas por assunto
    const statsPorAssunto = {};
    respostas.forEach(resposta => {
      const assunto = resposta.questao.assunto;
      if (!statsPorAssunto[assunto.id]) {
        statsPorAssunto[assunto.id] = {
          id: assunto.id,
          nome: assunto.nome,
          disciplina: resposta.questao.disciplina.nome,
          total: 0,
          acertos: 0,
          erros: 0,
          percentual: 0
        };
      }
      
      statsPorAssunto[assunto.id].total++;
      if (resposta.acertou) {
        statsPorAssunto[assunto.id].acertos++;
      } else {
        statsPorAssunto[assunto.id].erros++;
      }
    });

    // Calcular percentual por assunto
    Object.values(statsPorAssunto).forEach(stats => {
      stats.percentual = stats.total > 0 ? (stats.acertos / stats.total) * 100 : 0;
    });

    // Calcular estatísticas de tempo (últimos 30 dias)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    
    const respostasRecentes = respostas.filter(r => new Date(r.data_resposta) >= trintaDiasAtras);
    const acertosRecentes = respostasRecentes.filter(r => r.acertou).length;
    const percentualRecente = respostasRecentes.length > 0 ? (acertosRecentes / respostasRecentes.length) * 100 : 0;

    // Buscar dados do usuário
    const user = await User.findByPk(userId);

    res.json({
      success: true,
      stats: {
        geral: {
          totalRespostas,
          acertos,
          erros,
          percentualAcerto: Math.round(percentualAcerto * 100) / 100,
          xpTotal: user.xp || 0,
          questoesRespondidas: user.questoes_respondidas || 0
        },
        recente: {
          respostasUltimos30Dias: respostasRecentes.length,
          acertosUltimos30Dias: acertosRecentes,
          percentualUltimos30Dias: Math.round(percentualRecente * 100) / 100
        },
        porDisciplina: Object.values(statsPorDisciplina).map(stats => ({
          ...stats,
          percentual: Math.round(stats.percentual * 100) / 100
        })),
        porAssunto: Object.values(statsPorAssunto).map(stats => ({
          ...stats,
          percentual: Math.round(stats.percentual * 100) / 100
        }))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

// Rota para o gestor ver estatísticas de um usuário específico
router.get('/users/:id', authenticateToken, requireGestor, async (req, res) => {
  try {
    const userId = req.params.id;

    // Verificar se o usuário existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Buscar todas as respostas do usuário
    const respostas = await RespostaUsuario.findAll({
      where: { usuario_id: userId },
      include: [
        {
          model: Questao,
          as: 'questao',
          include: [
            { model: Disciplina, as: 'disciplina', attributes: ['id', 'nome'] },
            { model: Assunto, as: 'assunto', attributes: ['id', 'nome'] }
          ]
        }
      ],
      order: [['data_resposta', 'DESC']]
    });

    // Calcular estatísticas gerais
    const totalRespostas = respostas.length;
    const acertos = respostas.filter(r => r.acertou).length;
    const erros = totalRespostas - acertos;
    const percentualAcerto = totalRespostas > 0 ? (acertos / totalRespostas) * 100 : 0;

    // Calcular estatísticas por disciplina
    const statsPorDisciplina = {};
    respostas.forEach(resposta => {
      const disciplina = resposta.questao.disciplina;
      if (!statsPorDisciplina[disciplina.id]) {
        statsPorDisciplina[disciplina.id] = {
          id: disciplina.id,
          nome: disciplina.nome,
          total: 0,
          acertos: 0,
          erros: 0,
          percentual: 0
        };
      }
      
      statsPorDisciplina[disciplina.id].total++;
      if (resposta.acertou) {
        statsPorDisciplina[disciplina.id].acertos++;
      } else {
        statsPorDisciplina[disciplina.id].erros++;
      }
    });

    // Calcular percentual por disciplina
    Object.values(statsPorDisciplina).forEach(stats => {
      stats.percentual = stats.total > 0 ? (stats.acertos / stats.total) * 100 : 0;
    });

    // Calcular estatísticas por assunto
    const statsPorAssunto = {};
    respostas.forEach(resposta => {
      const assunto = resposta.questao.assunto;
      if (!statsPorAssunto[assunto.id]) {
        statsPorAssunto[assunto.id] = {
          id: assunto.id,
          nome: assunto.nome,
          disciplina: resposta.questao.disciplina.nome,
          total: 0,
          acertos: 0,
          erros: 0,
          percentual: 0
        };
      }
      
      statsPorAssunto[assunto.id].total++;
      if (resposta.acertou) {
        statsPorAssunto[assunto.id].acertos++;
      } else {
        statsPorAssunto[assunto.id].erros++;
      }
    });

    // Calcular percentual por assunto
    Object.values(statsPorAssunto).forEach(stats => {
      stats.percentual = stats.total > 0 ? (stats.acertos / stats.total) * 100 : 0;
    });

    // Calcular estatísticas de tempo (últimos 30 dias)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    
    const respostasRecentes = respostas.filter(r => new Date(r.data_resposta) >= trintaDiasAtras);
    const acertosRecentes = respostasRecentes.filter(r => r.acertou).length;
    const percentualRecente = respostasRecentes.length > 0 ? (acertosRecentes / respostasRecentes.length) * 100 : 0;

    // Calcular progresso ao longo do tempo (últimos 7 dias)
    const progressoDiario = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      data.setHours(0, 0, 0, 0);
      
      const proximoDia = new Date(data);
      proximoDia.setDate(proximoDia.getDate() + 1);
      
      const respostasDoDia = respostas.filter(r => {
        const dataResposta = new Date(r.data_resposta);
        return dataResposta >= data && dataResposta < proximoDia;
      });
      
      const acertosDoDia = respostasDoDia.filter(r => r.acertou).length;
      const percentualDoDia = respostasDoDia.length > 0 ? (acertosDoDia / respostasDoDia.length) * 100 : 0;
      
      progressoDiario.push({
        data: data.toISOString().split('T')[0],
        total: respostasDoDia.length,
        acertos: acertosDoDia,
        percentual: Math.round(percentualDoDia * 100) / 100
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        status: user.status,
        tipo_usuario: user.tipo_usuario,
        xp: user.xp || 0,
        questoes_respondidas: user.questoes_respondidas || 0,
        ultimo_login: user.ultimo_login
      },
      stats: {
        geral: {
          totalRespostas,
          acertos,
          erros,
          percentualAcerto: Math.round(percentualAcerto * 100) / 100,
          xpTotal: user.xp || 0,
          questoesRespondidas: user.questoes_respondidas || 0
        },
        recente: {
          respostasUltimos30Dias: respostasRecentes.length,
          acertosUltimos30Dias: acertosRecentes,
          percentualUltimos30Dias: Math.round(percentualRecente * 100) / 100
        },
        porDisciplina: Object.values(statsPorDisciplina).map(stats => ({
          ...stats,
          percentual: Math.round(stats.percentual * 100) / 100
        })),
        porAssunto: Object.values(statsPorAssunto).map(stats => ({
          ...stats,
          percentual: Math.round(stats.percentual * 100) / 100
        })),
        progressoDiario
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

module.exports = router;
