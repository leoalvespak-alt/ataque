const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RespostaUsuario = sequelize.define('RespostaUsuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  alternativa_marcada: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
    allowNull: false
  },
  acertou: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  tempo_resposta: {
    type: DataTypes.INTEGER, // em segundos
    allowNull: true
  },
  data_resposta: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'respostas_usuarios',
  indexes: [
    {
      unique: true,
      fields: ['usuario_id', 'questao_id']
    }
  ]
});

module.exports = RespostaUsuario;
