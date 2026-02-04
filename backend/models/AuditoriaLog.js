const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditoriaLog = sequelize.define('AuditoriaLog', {
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
  accion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tipo de acción: crear, actualizar, eliminar, login, logout, confirmar_reserva, etc.'
  },
  entidad: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Entidad afectada: usuario, reserva, area, conjunto, configuracion'
  },
  entidadId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del registro afectado (si aplica)'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada de la acción'
  },
  datosAnteriores: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON con los datos antes del cambio (para actualizaciones)'
  },
  datosNuevos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON con los datos después del cambio'
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Dirección IP del usuario'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent del navegador'
  }
}, {
  tableName: 'auditoria_logs',
  timestamps: true,
  updatedAt: false 
});

module.exports = AuditoriaLog;
