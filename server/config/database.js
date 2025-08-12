const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Testar conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
  }
}

module.exports = { sequelize, testConnection };
