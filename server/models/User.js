const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.VIRTUAL,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  hash_senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('gratuito', 'premium'),
    defaultValue: 'gratuito',
    allowNull: false
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  patente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'patentes',
      key: 'id'
    }
  },
  tipo_usuario: {
    type: DataTypes.ENUM('aluno', 'gestor'),
    defaultValue: 'aluno',
    allowNull: false
  },
  questoes_respondidas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  ultimo_login: {
    type: DataTypes.DATE
  },
  profile_picture_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL da foto de perfil do usuário'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  hooks: {
    beforeValidate: async (user) => {
      if (user.senha) {
        user.hash_senha = await bcrypt.hash(user.senha, 12);
        console.log('Hash gerado:', user.hash_senha);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('senha')) {
        user.hash_senha = await bcrypt.hash(user.senha, 12);
        console.log('Hash atualizado:', user.hash_senha);
      }
    }
  }
});

// Método para verificar senha
User.prototype.verificarSenha = async function(senha) {
  return await bcrypt.compare(senha, this.hash_senha);
};

// Método para adicionar XP
User.prototype.adicionarXP = async function(pontos) {
  this.xp += pontos;
  return await this.save();
};

// Método para verificar se pode responder mais questões (usuário gratuito)
User.prototype.podeResponderQuestao = function() {
  if (this.status === 'premium') return true;
  return this.questoes_respondidas < 10;
};

module.exports = User;
