const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssinaturaUsuario = sequelize.define('AssinaturaUsuario', {
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
  plano_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'planos_assinatura',
      key: 'id'
    }
  },
  asaas_subscription_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  data_expiracao: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ativa', 'cancelada', 'inadimplente', 'expirada'),
    defaultValue: 'ativa',
    allowNull: false
  },
  valor_pago: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  proxima_cobranca: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'assinaturas_usuarios'
});

module.exports = AssinaturaUsuario;
