const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporter
// Se asume el uso de Gmail con App Password
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Permitir certificados autofirmados (solo para desarrollo)
  },
  // Timeout más corto para fallar rápido en producción
  connectionTimeout: 10000, // 10 segundos
  greetingTimeout: 10000,
  socketTimeout: 10000
});

const enviarCredenciales = async (email, usuario, contraseña) => {
  try {
    // Si no hay credenciales configuradas, solo loguear (para dev)
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.warn('⚠️ GMAIL_USER o GMAIL_PASS no configurados. Saltando envío de correo.');
      console.log(`[SIMULACIÓN CORREO] Para: ${email} | Usuario: ${usuario} | Pass: ${contraseña}`);
      return false;
    }

    const mailOptions = {
      from: `"Soporte ReservasApp" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Bienvenido a ReservasApp - Tus Credenciales',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4a90e2; text-align: center;">¡Bienvenido a ReservasApp!</h2>
          <p>Hola,</p>
          <p>Se ha creado una nueva cuenta de usuario para ti. A continuación encontrarás tus credenciales de acceso:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Usuario:</strong> ${usuario}</p>
            <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${contraseña}</p>
          </div>

          <p>Por razones de seguridad, te recomendamos cambiar tu contraseña una vez que ingreses al sistema.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: %s', info.messageId);
    return true;

  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }
};

const enviarCambioContraseña = async (email, usuario, nuevaContraseña) => {
  try {
    // Si no hay credenciales configuradas, solo loguear (para dev)
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.warn('⚠️ GMAIL_USER o GMAIL_PASS no configurados. Saltando envío de correo.');
      console.log(`[SIMULACIÓN CORREO - CAMBIO CONTRASEÑA] Para: ${email} | Usuario: ${usuario} | Nueva Pass: ${nuevaContraseña}`);
      return false;
    }

    const mailOptions = {
      from: `"Soporte ReservasApp" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'ReservasApp - Tu contraseña ha sido actualizada',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4a90e2; text-align: center;">Cambio de Contraseña</h2>
          <p>Hola,</p>
          <p>Tu contraseña ha sido actualizada exitosamente. A continuación encontrarás tus nuevas credenciales de acceso:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Usuario:</strong> ${usuario}</p>
            <p style="margin: 5px 0;"><strong>Nueva Contraseña:</strong> ${nuevaContraseña}</p>
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Importante:</strong> Por razones de seguridad, te recomendamos cambiar tu contraseña una vez que ingreses al sistema.</p>
          </div>
          
          <p>Si no solicitaste este cambio, por favor contacta al administrador del sistema inmediatamente.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de cambio de contraseña enviado: %s', info.messageId);
    return true;

  } catch (error) {
    console.error('Error al enviar correo de cambio de contraseña:', error);
    return false;
  }
};

module.exports = {
  enviarCredenciales,
  enviarCambioContraseña
};
