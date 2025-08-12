const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ComentarioAluno = sequelize.define('ComentarioAluno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('DUVIDA', 'SUGESTAO', 'ERRO', 'ELOGIO', 'GERAL'),
    defaultValue: 'GERAL',
    allowNull: false,
    comment: 'Tipo do comentário'
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
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Número de likes no comentário'
  },
  aprovado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se o comentário foi aprovado pelo admin'
  },
  respondido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se o comentário foi respondido pelo admin'
  },
  resposta_admin: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Resposta do administrador ao comentário'
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  data_resposta: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da resposta do administrador'
  }
}, {
  tableName: 'comentarios_alunos'
});

module.exports = ComentarioAluno;
