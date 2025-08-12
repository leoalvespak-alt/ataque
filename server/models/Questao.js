const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Questao = sequelize.define('Questao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  enunciado: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  alternativa_a: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  alternativa_b: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  alternativa_c: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  alternativa_d: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  alternativa_e: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gabarito: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('MULTIPLA_ESCOLHA', 'CERTO_ERRADO'),
    defaultValue: 'MULTIPLA_ESCOLHA',
    allowNull: false,
    comment: 'Tipo da questão: múltipla escolha ou certo/errado'
  },
  comentario_professor: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ano: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1900,
      max: new Date().getFullYear()
    }
  },
  disciplina_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'disciplinas',
      key: 'id'
    }
  },
  assunto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assuntos',
      key: 'id'
    }
  },
  banca_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bancas',
      key: 'id'
    }
  },
  orgao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orgaos',
      key: 'id'
    }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'questoes'
});

module.exports = Questao;
