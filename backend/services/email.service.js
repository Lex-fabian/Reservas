const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar transporter (soporta múltiples proveedores)
let transporter = null;

if (process.env.BREVO_API_KEY) {
  // Brevo (SendinBlue) - No requiere dominio
  transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
      user: process.env.BREVO_USER, // Tu email de Brevo
      pass: process.env.BREVO_API_KEY // Tu API key
    }
  });
} else if (process.env.RESEND_API_KEY) {
  // Resend (requiere dominio para envío directo)
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
}

const enviarCredenciales = async (email, usuario, contraseña) => {
  try {
    if (!transporter && !process.env.RESEND_API_KEY) {
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

    // Usar Brevo/Nodemailer si está configurado
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"ReservasApp" <noreply@reservasapp.com>',
        to: email,
        subject: 'Bienvenido a ReservasApp - Tus Credenciales',
        html: htmlContent
      });
      console.log('✅ Correo enviado exitosamente a:', email);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }
};

const enviarCambioContraseña = async (email, usuario, nuevaContraseña) => {
  try {
    // Si no hay API key configurada, solo loguear (para dev)
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY no configurado. Saltando envío de correo.');
      console.log(`[SIMULACIÓN CORREO] Para: ${email} | Usuario: ${usuario} | Pass: ${contraseña}`);
      return false;
    }

    // En modo de prueba (sin dominio verificado), enviar a email del admin
    const emailDestino = process.env.RESEND_VERIFIED_DOMAIN ? email : 'angello.angulo.jic@gmail.com';
    const esModoPrueba = !process.env.RESEND_VERIFIED_DOMAIN;

    const { data, error } = await resend.emails.send({
      from: 'ReservasApp <onboarding@resend.dev>', // Usar dominio verificado en producción
      to: [emailDestino],
      subject: esModoPrueba 
        ? `[PRUEBA] Credenciales para ${email}` 
        : 'Bienvenido a ReservasApp - Tus Credenciales',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          ${esModoPrueba ? `
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ MODO DE PRUEBA:</strong> Este email debería enviarse a <strong>${email}</strong> pero Resend requiere dominio verificado. Por favor, comparte estas credenciales manualmente.</p>
            </div>
          ` : ''}
          <h2 style="color: #4a90e2; text-align: center;">¡Bienvenido a ReservasApp!</h2>
          <p>Hola,</p>
          <p>Se ha creado una nueva cuenta de usuario${esModoPrueba ? ` para <strong>${email}</strong>` : ''}. A continuación encontrarás las credenciales de acceso:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${esModoPrueba ? `<p style="margin: 5px 0;"><strong>Email destinatario:</strong> ${email}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Usuario:</strong> ${usuario}</p>
            <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${contraseña}</p>
          </div>

          <p>Por razones de seguridad, te recomendamos cambiar tu contraseña una vez que ingreses al sistema.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
      `
    });

    if (error) {
      console.error('Error de Resend:', error);
      return false;
    }

    if (esModoPrueba) {
      console.log(`⚠️ Correo enviado en modo prueba a ${emailDestino} (destinatario real: ${email}):`, data.id);
    } else {
      console.log('✅ Correo enviado exitosamente:', data.id);
    }
    return true;

  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }
};

const enviarCambioContraseña = async (email, usuario, nuevaContraseña) => {
  try {
    // Si no hay API key configurada, solo loguear (para dev)
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY no configurado. Saltando envío de correo.');
      console.log(`[SIMULACIÓN CORREO - CAMBIO CONTRASEÑA] Para: ${email} | Usuario: ${usuario} | Nueva Pass: ${nuevaContraseña}`);
      return false;
    }

    // En modo de prueba (sin dominio verificado), enviar a email del admin
    const emailDestino = process.env.RESEND_VERIFIED_DOMAIN ? email : 'angello.angulo.jic@gmail.com';
    const esModoPrueba = !process.env.RESEND_VERIFIED_DOMAIN;

    const { data, error } = await resend.emails.send({
      from: 'ReservasApp <onboarding@resend.dev>', // Usar dominio verificado en producción
      to: [emailDestino],
      subject: esModoPrueba 
        ? `[PRUEBA] Cambio de contraseña para ${email}` 
        : 'ReservasApp - Tu contraseña ha sido actualizada',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          ${esModoPrueba ? `
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ MODO DE PRUEBA:</strong> Este email debería enviarse a <strong>${email}</strong> pero Resend requiere dominio verificado. Por favor, comparte estas credenciales manualmente.</p>
            </div>
          ` : ''}
          <h2 style="color: #4a90e2; text-align: center;">Cambio de Contraseña</h2>
          <p>Hola,</p>
          <p>Tu contraseña ha sido actualizada exitosamente${esModoPrueba ? ` para <strong>${email}</strong>` : ''}. A continuación encontrarás tus nuevas credenciales de acceso:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${esModoPrueba ? `<p style="margin: 5px 0;"><strong>Email destinatario:</strong> ${email}</p>` : ''}
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
    });

    if (error) {
      console.error('Error de Resend:', error);
      return false;
    }

    if (esModoPrueba) {
      console.log(`⚠️ Correo de cambio de contraseña enviado en modo prueba a ${emailDestino} (destinatario real: ${email}):`, data.id);
    } else {
      console.log('✅ Correo de cambio de contraseña enviado exitosamente:', data.id);
    }
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
