const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Assunto = sequelize.define('Assunto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  disciplina_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'disciplinas',
      key: 'id'
    }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'assuntos'
});

module.exports = Assunto;
