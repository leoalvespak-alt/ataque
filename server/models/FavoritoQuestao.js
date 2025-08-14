const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FavoritoQuestao = sequelize.define('FavoritoQuestao', {
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
	}
}, {
	tableName: 'favoritos_questoes',
	timestamps: false,
	indexes: [
		{ unique: true, fields: ['usuario_id', 'questao_id'] }
	]
});

module.exports = FavoritoQuestao;


