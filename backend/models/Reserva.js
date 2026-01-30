const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  conjuntoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'conjuntos',
      key: 'id'
    }
  },
  areaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'areas',
      key: 'id'
    }
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  personas: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  foto_comprobante: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
    defaultValue: 'pendiente'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  motivo_cancelacion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reservas',
  timestamps: true
});

module.exports = Reserva;

// Relaciones
const Usuario = require('./Usuario');
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Usuario.hasMany(Reserva, { foreignKey: 'usuarioId', as: 'reservas' });

module.exports = Reserva;
