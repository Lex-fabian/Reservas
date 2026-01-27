const jwt = require('jsonwebtoken');

const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const { Usuario, Conjunto } = require('../models');

const esSuperAdmin = (req, res, next) => {
  const tipoUsuario = req.usuario.tipo_usuario;
  if (tipoUsuario !== 'superadmin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de SuperAdmin' });
  }
  next();
};

const esAdminOSuper = async (req, res, next) => {
  try {
    const tipoUsuario = req.usuario.tipo_usuario;
    
    if (tipoUsuario === 'superadmin') {
      req.esSuperAdmin = true;
      return next();
    }

    if (tipoUsuario === 'admin') {
      // Obtener los conjuntos asignados para scope
      const usuario = await Usuario.findByPk(req.usuario.id, {
        include: [{
          model: Conjunto,
          as: 'conjuntos',
          attributes: ['id']
        }]
      });

      if (!usuario) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      req.esSuperAdmin = false;
      // Array de IDs de conjuntos permitidos
      req.scopeConjuntos = usuario.conjuntos.map(c => c.id);
      
      return next();
    }

    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador' });
  } catch (error) {
    console.error('Error en middleware RBAC:', error);
    res.status(500).json({ error: 'Error interno de autorización' });
  }
};

module.exports = { generarToken, verificarToken, esSuperAdmin, esAdminOSuper };
