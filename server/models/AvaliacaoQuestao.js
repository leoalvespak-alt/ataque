const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AvaliacaoQuestao = sequelize.define('AvaliacaoQuestao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Nota de 1 a 5 estrelas'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  questao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'questoes',
      key: 'id'
    }
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'avaliacoes_questoes',
  indexes: [
    {
      unique: true,
      fields: ['usuario_id', 'questao_id'],
      name: 'unique_usuario_questao_avaliacao'
    }
  ]
});

module.exports = AvaliacaoQuestao;
