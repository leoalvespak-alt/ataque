const express = require('express');
const { PlanoAssinatura } = require('../models');

const router = express.Router();

// Buscar todos os planos ativos
router.get('/', async (req, res) => {
  try {
    const planos = await PlanoAssinatura.findAll({
      where: { ativo: true },
      order: [['preco', 'ASC']]
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
router.get('/:id', async (req, res) => {
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

module.exports = router;
