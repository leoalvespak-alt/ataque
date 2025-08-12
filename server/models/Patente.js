const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patente = sequelize.define('Patente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  xp_necessario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  icone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  cor: {
    type: DataTypes.STRING(7), // Código hexadecimal da cor
    allowNull: true,
    defaultValue: '#c1121f'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'patentes',
  timestamps: true,
  createdAt: 'data_criacao',
  updatedAt: 'data_atualizacao'
});

module.exports = Patente;
