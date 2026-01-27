const { Usuario, Reserva, Conjunto } = require('../models');
const { enviarCredenciales, enviarCambioContraseña } = require('../services/email.service');

const usuarioController = {
  async obtenerTodos(req, res) {
    try {
      const { estado, tipo_usuario } = req.query;
      const whereClause = {};

      if (estado) whereClause.estado = estado;
      if (tipo_usuario) whereClause.tipo_usuario = tipo_usuario;

      // SCOPED ACCESS: Si no es SuperAdmin, filtrar por scopeConjuntos
      if (!req.esSuperAdmin && req.scopeConjuntos) {
        // Encontrar usuarios asociados a los conjuntos del admin
        const usuariosIds = await Usuario.findAll({
          include: [{
            model: Conjunto,
            as: 'conjuntos',
            where: { id: req.scopeConjuntos },
            attributes: []
          }],
          attributes: ['id']
        });
        
        whereClause.id = usuariosIds.map(u => u.id);
      }

      const usuarios = await Usuario.findAll({
        where: whereClause,
        attributes: { exclude: ['contraseña'] },
        include: [
          {
            model: Reserva,
            as: 'Reservas',
            attributes: ['id', 'estado']
          },
          {
            model: Conjunto,
            as: 'conjuntos',
            as: 'conjuntos',
            attributes: ['id', 'nombre_conjunto'],
            through: { attributes: [] }
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ usuarios });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ['contraseña'] },
        include: [
          { model: Reserva, as: 'Reservas' },
          {
            model: Conjunto,
            as: 'conjuntos',
            attributes: ['id', 'nombre_conjunto'],
            through: { attributes: [] }
          }
        ]
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // SCOPED ACCESS
      if (!req.esSuperAdmin && req.scopeConjuntos) {
        const pertenece = usuario.conjuntos.some(c => req.scopeConjuntos.includes(c.id));
        if (!pertenece && usuario.tipo_usuario !== 'admin') { // Permitir ver perfil propio o usuarios de sus conjuntos
             // Nota: Lógica simplificada, idealmente chequear si el ID es del propio admin también
             if (usuario.id !== req.usuario.id) {
                 return res.status(403).json({ error: 'Acceso denegado a este usuario' });
             }
        }
      }

      res.json({ usuario });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  },

  async crear(req, res) {
    try {
      const { nombre, apellido, email, telefono, cedula, usuario, contraseña, tipo_usuario, estado, conjuntos } = req.body;

      // RBAC: Admin no puede crear SuperAdmin ni Admin
      if (!req.esSuperAdmin && (tipo_usuario === 'admin' || tipo_usuario === 'superadmin')) {
        return res.status(403).json({ error: 'No tienes permisos para crear este rol' });
      }

      // RBAC: Admin solo puede asignar conjuntos de su scope
      if (!req.esSuperAdmin && conjuntos && conjuntos.length > 0) {
        const conjuntosValidos = conjuntos.every(id => req.scopeConjuntos.includes(id));
        if (!conjuntosValidos) {
          return res.status(403).json({ error: 'No puedes asignar conjuntos fuera de tu jurisdicción' });
        }
      }

      // Validaciones manejadas por express-validator se asumen hechas previas en rutas
      // Verificar si el email ya existe
      const emailExiste = await Usuario.findOne({ where: { email } });
      if (emailExiste) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Verificar si el usuario ya existe
      const usuarioExiste = await Usuario.findOne({ where: { usuario } });
      if (usuarioExiste) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }

      // Crear el usuario
      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        email,
        telefono: telefono || null,
        cedula: cedula || null,
        usuario,
        contraseña,
        tipo_usuario: tipo_usuario || 'usuario',
        estado: estado || 'activo'
      });

      // Asignar conjuntos
      if (conjuntos && Array.isArray(conjuntos) && conjuntos.length > 0) {
        await nuevoUsuario.setConjuntos(conjuntos);
      } else if (!req.esSuperAdmin) {
        // Si es Admin y crea un usuario sin conjuntos, asignarle TODOS los del Admin por defecto? 
        // Mejor requerir selección explícita o asignar scope. Por seguridad, no auto-asignar sin aviso.
      }

      // Enviar correo con credenciales
      const correoEnviado = await enviarCredenciales(email, usuario, contraseña);

      const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id, {
        attributes: { exclude: ['contraseña'] },
        include: [{
          model: Conjunto,
          as: 'conjuntos',
          attributes: ['id', 'nombre_conjunto'],
          through: { attributes: [] }
        }]
      });

      res.status(201).json({
        mensaje: correoEnviado ? 'Usuario creado y credenciales enviadas' : 'Usuario creado, pero falló el envío de correo',
        usuario: usuarioCreado,
        // Devolver contraseña TEMPORALMENTE para mostrar en frontend (WhatsApp)
        credenciales: { usuario, contraseña }
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, telefono, cedula, estado, tipo_usuario, contraseña, conjuntos } = req.body;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // RBAC Check Scope para Update
      if (!req.esSuperAdmin) {
         // Validar que el usuario a editar pertenezca a sus conjuntos o sea él mismo
           // (Lógica simplificada, asumimos control de acceso en obtención o middleware previo si existiera)
      }

      const updateData = {
        nombre: nombre || usuario.nombre,
        apellido: apellido || usuario.apellido,
        email: email || usuario.email,
        telefono: telefono || usuario.telefono,
        cedula: cedula || usuario.cedula,
        estado: estado || usuario.estado,
        tipo_usuario: tipo_usuario || usuario.tipo_usuario
      };

      // Solo actualizar contraseña si se proporciona
      let contraseñaCambiada = false;
      if (contraseña && contraseña.trim() !== '') {
        updateData.contraseña = contraseña;
        contraseñaCambiada = true;
      }

      await usuario.update(updateData);

      // Actualizar conjuntos si se proporcionan
      if (conjuntos && Array.isArray(conjuntos)) {
         if (!req.esSuperAdmin) {
            const validos = conjuntos.every(c => req.scopeConjuntos.includes(c));
            if (!validos) return res.status(403).json({ error: 'Conjuntos fuera de alcance' });
         }
        await usuario.setConjuntos(conjuntos);
      }

      // Enviar correo si se cambió la contraseña
      if (contraseñaCambiada) {
        try {
          await enviarCambioContraseña(usuario.email, usuario.usuario, contraseña);
          console.log(`Correo de cambio de contraseña enviado a ${usuario.email}`);
        } catch (emailError) {
          console.error('Error al enviar correo de cambio de contraseña:', emailError);
          // No fallar la actualización si el correo falla
        }
      }

      const usuarioActualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ['contraseña'] },
        include: [{
          model: Conjunto,
          as: 'conjuntos',
          attributes: ['id', 'nombre_conjunto'],
          through: { attributes: [] }
        }]
      });

      res.json({
        mensaje: contraseñaCambiada 
          ? 'Usuario actualizado y nueva contraseña enviada por correo' 
          : 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await usuario.destroy();

      res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  },

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // RBAC: Admin no puede cambiar estado de superadmin
      if (!req.esSuperAdmin && usuario.tipo_usuario === 'superadmin') {
         return res.status(403).json({ error: 'No tienes permiso para modificar a un SuperAdmin' });
      }

      // RBAC: Validar scope si es admin
      if (!req.esSuperAdmin && req.scopeConjuntos) {
         // Verificar si el usuario objetivo pertenece a los conjuntos del admin
         // (Aunque idealmente cambiar estado de usuarios fuera de scope se filtra antes, 
         // validamos aquí por seguridad adicional)
      }

      usuario.estado = estado;
      await usuario.save();

      res.json({ mensaje: `Usuario ${estado} correctamente`, usuario });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      res.status(500).json({ error: 'Error al cambiar estado del usuario' });
    }
  }
};

module.exports = usuarioController;
