const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar transporter para Brevo SMTP
let transporter = null;

if (process.env.BREVO_API_KEY) {
  transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_API_KEY
    },
    tls: {
      rejectUnauthorized: false // Para evitar problemas de certificado en desarrollo
    }
  });
  
  console.log('📧 Transporter SMTP configurado para Brevo');
}

const enviarCredenciales = async (email, usuario, contraseña) => {
  try {
    if (!transporter) {
      console.warn('⚠️ No hay servicio de email configurado');
      console.log(`[SIMULACIÓN] Email: ${email} | Usuario: ${usuario} | Pass: ${contraseña}`);
      return false;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">¡Bienvenido a ReservasApp!</h2>
        <p>Hola,</p>
        <p>Se ha creado una nueva cuenta de usuario. A continuación encontrarás las credenciales de acceso:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Usuario:</strong> ${usuario}</p>
          <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${contraseña}</p>
        </div>

        <p>Por razones de seguridad, te recomendamos cambiar tu contraseña una vez que ingreses al sistema.</p>
        
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
    
    console.log('✅ Correo de credenciales enviado exitosamente a:', email);
    return true;

  } catch (error) {
    console.error('❌ Error al enviar correo de credenciales:', error);
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

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">Cambio de Contraseña - ReservasApp</h2>
        <p>Hola,</p>
        <p>Tu contraseña ha sido actualizada exitosamente. A continuación encontrarás tus nuevas credenciales:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Usuario:</strong> ${usuario}</p>
          <p style="margin: 5px 0;"><strong>Nueva Contraseña:</strong> ${nuevaContraseña}</p>
        </div>

        <p>Por razones de seguridad, te recomendamos cambiar tu contraseña una vez que ingreses al sistema.</p>
        
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
    
    console.log('✅ Correo de cambio de contraseña enviado exitosamente a:', email);
    return true;

  } catch (error) {
    console.error('❌ Error al enviar correo de cambio de contraseña:', error);
    return false;
  }
};

module.exports = {
  enviarCredenciales,
  enviarCambioContraseña
};
