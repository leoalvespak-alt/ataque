const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlanoAssinatura = sequelize.define('PlanoAssinatura', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  recorrencia: {
    type: DataTypes.ENUM('mensal', 'anual'),
    allowNull: false
  },
  asaas_plan_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  beneficios: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'planos_assinatura'
});

module.exports = PlanoAssinatura;
