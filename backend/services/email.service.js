const { Resend } = require('resend');
require('dotenv').config();

// Configurar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const enviarCredenciales = async (email, usuario, contraseña) => {
  try {
    // Si no hay API key configurada, solo loguear (para dev)
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY no configurado. Saltando envío de correo.');
      console.log(`[SIMULACIÓN CORREO] Para: ${email} | Usuario: ${usuario} | Pass: ${contraseña}`);
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: 'ReservasApp <onboarding@resend.dev>', // Usar dominio verificado en producción
      to: [email],
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
    });

    if (error) {
      console.error('Error de Resend:', error);
      return false;
    }

    console.log('✅ Correo enviado exitosamente:', data.id);
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

    const { data, error } = await resend.emails.send({
      from: 'ReservasApp <onboarding@resend.dev>', // Usar dominio verificado en producción
      to: [email],
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
    });

    if (error) {
      console.error('Error de Resend:', error);
      return false;
    }

    console.log('✅ Correo de cambio de contraseña enviado exitosamente:', data.id);
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
