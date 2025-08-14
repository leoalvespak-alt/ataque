const { Sequelize } = require('sequelize');
const path = require('path');

// Preferir Postgres (Supabase) quando DATABASE_URL estiver definida; caso contrário, usar SQLite local
function createSequelizeInstance() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return new Sequelize(connectionString, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  }

  // Fallback para SQLite em desenvolvimento/local quando não houver DATABASE_URL
  return new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
}

const sequelize = createSequelizeInstance();

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
