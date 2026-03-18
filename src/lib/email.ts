import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { getSettings } from './settings';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const mailhogTransporter = nodemailer.createTransport({
  host: 'localhost',
  port: 11025,
  secure: false,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  disableAuth: true,
});

interface EmailOptions {
  to: string;
  nombre: string;
  datos?: {
    kit: { kwp: number; paneles: number; inversorKw: number };
    tipoTecho: string;
    tipoMedidor: string;
    precioFinal: number;
    montoBoleta: number;
  };
}

export async function sendQuoteEmail({ to, nombre, datos }: EmailOptions): Promise<void> {
  const settings = await getSettings();
  
  const emailFromName = String(settings.email_from_name || 'Enercity');
  const emailFromAddress = String(settings.email_from_address || 'presupuestos@enercity.cl');
  const telefono = String(settings.email_telefono || '+56912345678');
  
  const subject = `Tu Presupuesto Solar - ${nombre}`;
  const isDev = process.env.NODE_ENV === 'development' || !resend;

  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #059669;">☀️ ${emailFromName}</h1>
      <h2>Tu Presupuesto Solar</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Gracias por usar nuestro simulador solar. Aqui estan los detalles de tu presupuesto:</p>
  `;

  if (datos) {
    htmlContent += `
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Sistema Recomendado</h3>
        <p><strong>Potencia:</strong> ${datos.kit.kwp} kWP</p>
        <p><strong>Paneles:</strong> ${datos.kit.paneles} modulos</p>
        <p><strong>Inversor:</strong> ${datos.kit.inversorKw} kW</p>
        <p><strong>Tipo techo:</strong> ${datos.tipoTecho}</p>
        <p><strong>Tipo medidor:</strong> ${datos.tipoMedidor}</p>
        <p style="font-size: 18px; color: #059669;"><strong>Precio final: $${datos.precioFinal.toLocaleString('es-CL')}</strong></p>
      </div>
    `;
  }

  htmlContent += `
      <p>Este presupuesto incluye:</p>
      <ul>
        <li>✓ Instalacion profesional certificada</li>
        <li>✓ Inversor de marca reconocida</li>
        <li>✓ Paneles solares de alta eficiencia</li>
        <li>✓ Tramitacion ante la compania electrica</li>
        <li>✓ Garantia de 25 anos en paneles</li>
      </ul>
      <p style="margin-top: 20px;"><strong>Contacto:</strong> ${telefono}</p>
      <p style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; text-align: center;">
        <strong>Un ejecutivo te contactara pronto para finalizar la instalacion.</strong>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        © 2026 ${emailFromName}. Todos los derechos reservados.<br>
        Este presupuesto tiene validez por 30 dias.
      </p>
    </div>
  `;

  const fromAddress = isDev ? 'enercity@dev.local' : `${emailFromName} <${emailFromAddress}>`;

  const mailOptions: any = {
    from: fromAddress,
    to,
    subject,
    html: htmlContent,
  };

  if (isDev) {
    try {
      console.log(`[DEV] Enviando email a ${to}`);
      const info = await mailhogTransporter.sendMail(mailOptions);
      console.log(`[DEV] Email enviado a Mailhog: ${to}, MessageID: ${info.messageId}`);
    } catch (error) {
      console.error('[DEV] Error enviando a Mailhog:', error);
    }
  } else if (resend) {
    try {
      await resend.emails.send({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log(`[PROD] Email enviado via Resend: ${to}`);
    } catch (error) {
      console.error('[PROD] Error enviando via Resend:', error);
    }
  } else {
    console.warn('[WARN] No hay configuracion de email. Email no enviado.');
  }
}
