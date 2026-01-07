const Usuario = require('./Usuario');
const Conjunto = require('./Conjunto');
const Area = require('./Area');
const Reserva = require('./Reserva');

Conjunto.hasMany(Area, { foreignKey: 'conjuntoId' });
Area.belongsTo(Conjunto, { foreignKey: 'conjuntoId' });

Usuario.hasMany(Reserva, { foreignKey: 'usuarioId' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Conjunto.hasMany(Reserva, { foreignKey: 'conjuntoId' });
Reserva.belongsTo(Conjunto, { foreignKey: 'conjuntoId' });

Area.hasMany(Reserva, { foreignKey: 'areaId' });
Reserva.belongsTo(Area, { foreignKey: 'areaId' });

module.exports = {
  Usuario,
  Conjunto,
  Area,
  Reserva
};
