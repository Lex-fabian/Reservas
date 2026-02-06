const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar transporter para Brevo SMTP
let transporter = null;

if (process.env.BREVO_API_KEY) {
  transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 2525, // Puerto alternativo para hosting providers como Render
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_API_KEY
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 segundos
    greetingTimeout: 10000
  });
  
  console.log(' Transporter SMTP configurado para Brevo');
}

const enviarCredenciales = async (email, usuario, contraseña) => {
  try {
    if (!transporter) {
      console.warn(' No hay servicio de email configurado');
      console.log(`[SIMULACIÓN] Email: ${email} | Usuario: ${usuario} | Pass: ${contraseña}`);
      return false;
    }

    const appUrl = process.env.APP_URL || 'https://reservas-web-mu.vercel.app';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">¡Bienvenido a ReservasApp!</h2>
        <p>Hola,</p>
        <p>Se ha creado una nueva cuenta de usuario. A continuación encontrarás las credenciales de acceso:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Usuario:</strong> ${usuario}</p>
          <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${contraseña}</p>
        </div>

        <p>Por razones de seguridad, <strong>te recomendamos cambiar tu contraseña</strong> una vez que ingreses al sistema.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/login" style="display: inline-block; background: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Ir a Iniciar Sesión</a>
        </div>
        
        <p style="font-size: 13px; color: #666; text-align: center;">Inicia sesión con tus credenciales. Luego haz clic en tu perfil (arriba derecha) → "Mi Perfil" para cambiar tu contraseña.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ReservasApp" <noreply@reservasapp.com>',
      to: email,
      subject: 'Bienvenido a ReservasApp - Tus Credenciales',
      html: htmlContent
    });
    
    console.log(' Correo de credenciales enviado exitosamente a:', email);
    return true;

  } catch (error) {
    console.error(' Error al enviar correo de credenciales:', error);
    return false;
  }
};

const enviarCambioContraseña = async (email, usuario, nuevaContraseña) => {
  try {
    if (!transporter) {
      console.warn('⚠️ No hay servicio de email configurado');
      console.log(`[SIMULACIÓN - CAMBIO CONTRASEÑA] Email: ${email} | Usuario: ${usuario} | Nueva Pass: ${nuevaContraseña}`);
      return false;
    }

    const appUrl = process.env.APP_URL || 'https://reservas-web-mu.vercel.app';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">Cambio de Contraseña - ReservasApp</h2>
        <p>Hola,</p>
        <p>Tu contraseña ha sido actualizada exitosamente. A continuación encontrarás tus nuevas credenciales:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Usuario:</strong> ${usuario}</p>
          <p style="margin: 5px 0;"><strong>Nueva Contraseña:</strong> ${nuevaContraseña}</p>
        </div>

        <p>Por razones de seguridad, <strong>te recomendamos cambiar esta contraseña</strong> por una de tu preferencia.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/login" style="display: inline-block; background: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Ir a Iniciar Sesión</a>
        </div>
        
        <p style="font-size: 13px; color: #666; text-align: center;">Inicia sesión con tu nueva contraseña. Luego ve a tu perfil (arriba derecha) → "Mi Perfil" para cambiarla por una personalizada.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Si no solicitaste este cambio, contacta al administrador inmediatamente.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ReservasApp" <noreply@reservasapp.com>',
      to: email,
      subject: 'Tu contraseña ha sido actualizada - ReservasApp',
      html: htmlContent
    });
    
    console.log(' Correo de cambio de contraseña enviado exitosamente a:', email);
    return true;

  } catch (error) {
    console.error(' Error al enviar correo de cambio de contraseña:', error);
    return false;
  }
};

/**
 * ENVÍA NOTIFICACIÓN CUANDO UN USUARIO CREA UNA RESERVA (A ADMINISTRADORES)
 */
const enviarNotificacionReservaCreada = async (reserva, usuario, area, administradores) => {
  try {
    if (!transporter) {
      console.warn('⚠️ No hay servicio de email configurado');
      return false;
    }

    const appUrl = process.env.APP_URL || 'https://reservas-web-mu.vercel.app';
    const fecha = new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">🔔 Nueva Reserva Pendiente</h2>
        <p>Hola,</p>
        <p>Se ha creado una nueva reserva que requiere tu confirmación:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Área:</strong> ${area.nombre_area || 'No especificado'}</p>
          <p style="margin: 8px 0;"><strong>Usuario:</strong> ${usuario.nombre || ''} ${usuario.apellido || ''}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${usuario.email || 'No disponible'}</p>
          <p style="margin: 8px 0;"><strong>Fecha:</strong> ${fecha}</p>
          <p style="margin: 8px 0;"><strong>Hora:</strong> ${reserva.hora_inicio} - ${reserva.hora_fin}</p>
          <p style="margin: 8px 0;"><strong>Personas:</strong> ${reserva.personas}</p>
          ${reserva.observaciones ? `<p style="margin: 8px 0;"><strong>Observaciones:</strong> ${reserva.observaciones}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/reservas" style="display: inline-block; background: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Ver Reserva</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
      </div>
    `;

    // Enviar a todos los administradores
    for (const admin of administradores) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"ReservasApp" <noreply@reservasapp.com>',
        to: admin.email,
        subject: `Nueva Reserva - ${area.nombre_area}`,
        html: htmlContent
      });
    }
    
    console.log(` Notificación de nueva reserva enviada a ${administradores.length} administrador(es)`);
    return true;

  } catch (error) {
    console.error(' Error al enviar notificación de reserva creada:', error);
    return false;
  }
};

/**
 * ENVÍA NOTIFICACIÓN CUANDO UN ADMIN CONFIRMA UNA RESERVA (AL USUARIO)
 */
const enviarNotificacionReservaConfirmada = async (reserva, usuario, area) => {
  try {
    if (!transporter) {
      console.warn('⚠️ No hay servicio de email configurado');
      return false;
    }

    const appUrl = process.env.APP_URL || 'https://reservas-web-mu.vercel.app';
    const fecha = new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">✅ Reserva Confirmada</h2>
        <p>Hola ${usuario.nombre || 'Usuario'},</p>
        <p>¡Buenas noticias! Tu reserva ha sido <strong>confirmada</strong>.</p>
        
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p style="margin: 8px 0;"><strong>Área:</strong> ${area.nombre_area || 'No especificado'}</p>
          <p style="margin: 8px 0;"><strong>Fecha:</strong> ${fecha}</p>
          <p style="margin: 8px 0;"><strong>Hora:</strong> ${reserva.hora_inicio} - ${reserva.hora_fin}</p>
          <p style="margin: 8px 0;"><strong>Personas:</strong> ${reserva.personas}</p>
          ${reserva.observaciones ? `<p style="margin: 8px 0;"><strong>Observaciones:</strong> ${reserva.observaciones}</p>` : ''}
        </div>

        <p style="color: #555;">Recuerda llegar puntual y seguir las normas del área.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/mis-reservas" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Ver Mis Reservas</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ReservasApp" <noreply@reservasapp.com>',
      to: usuario.email,
      subject: `Reserva Confirmada - ${area.nombre_area}`,
      html: htmlContent
    });
    
    console.log(` Notificación de confirmación enviada a: ${usuario.email}`);
    return true;

  } catch (error) {
    console.error(' Error al enviar notificación de reserva confirmada:', error);
    return false;
  }
};

/**
 * ENVÍA NOTIFICACIÓN CUANDO SE CANCELA UNA RESERVA (AL USUARIO)
 */
const enviarNotificacionReservaCancelada = async (reserva, usuario, area, motivo = '') => {
  try {
    if (!transporter) {
      console.warn('⚠️ No hay servicio de email configurado');
      return false;
    }

    const appUrl = process.env.APP_URL || 'https://reservas-web-mu.vercel.app';
    const fecha = new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #f44336; text-align: center;">❌ Reserva Cancelada</h2>
        <p>Hola ${usuario.nombre || 'Usuario'},</p>
        <p>Tu reserva ha sido <strong>cancelada</strong>.</p>
        
        <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f44336;">
          <p style="margin: 8px 0;"><strong>Área:</strong> ${area.nombre_area || 'No especificado'}</p>
          <p style="margin: 8px 0;"><strong>Fecha:</strong> ${fecha}</p>
          <p style="margin: 8px 0;"><strong>Hora:</strong> ${reserva.hora_inicio} - ${reserva.hora_fin}</p>
          ${motivo ? `<p style="margin: 8px 0;"><strong>Motivo:</strong> ${motivo}</p>` : ''}
        </div>

        <p style="color: #555;">Puedes realizar una nueva reserva cuando lo desees.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/reservas" style="display: inline-block; background: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Hacer Nueva Reserva</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ReservasApp" <noreply@reservasapp.com>',
      to: usuario.email,
      subject: `Reserva Cancelada - ${area.nombre_area}`,
      html: htmlContent
    });
    
    console.log(` Notificación de cancelación enviada a: ${usuario.email}`);
    return true;

  } catch (error) {
    console.error(' Error al enviar notificación de reserva cancelada:', error);
    return false;
  }
};

module.exports = {
  enviarCredenciales,
  enviarCambioContraseña,
  enviarNotificacionReservaCreada,
  enviarNotificacionReservaConfirmada,
  enviarNotificacionReservaCancelada,
};
