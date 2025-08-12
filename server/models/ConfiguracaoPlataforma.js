const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConfiguracaoPlataforma = sequelize.define('ConfiguracaoPlataforma', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chave: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'configuracoes_plataforma'
});

module.exports = ConfiguracaoPlataforma;
