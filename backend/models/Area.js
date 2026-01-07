const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Area = sequelize.define('Area', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conjuntoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'conjuntos',
      key: 'id'
    }
  },
  nombre_area: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  maximo_personas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  fotos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  costo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  tiempo_minimo: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'areas',
  timestamps: true
});

module.exports = Area;
