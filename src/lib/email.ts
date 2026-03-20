import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  nombre: string;
  datos: {
    kit: { kwp: number; paneles: number; inversorKw: number };
    tipoTecho: string;
    tipoMedidor: string;
    precioFinal: number;
    montoBoleta: number;
  };
}

export async function sendQuoteEmail({ to, nombre, datos }: EmailOptions) {
  try {

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>', // USA ESTO EXACTAMENTE
  to: ['mojeda@agenciasur.cl'], // USA TU CORREO AQUÍ
  subject: 'Prueba de Enercity Solar',
  html: '<h1>¡Funciona!</h1>'
});
/*
    const { data, error } = await resend.emails.send({
      from: 'Enercity Solar <presupuestos@enercity.cl>', // Dominio verificado en Resend
      to: [to],
      subject: `☀️ Tu Presupuesto Solar - ${nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #154660;">
          <h1 style="color: #F07E04;">¡Hola ${nombre}!</h1>
          <p>Hemos generado tu presupuesto basado en una boleta de <strong>$${datos.montoBoleta.toLocaleString('es-CL')}</strong>.</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 10px;">
            <h3>Detalles del Sistema:</h3>
            <ul>
              <li>Potencia: ${datos.kit.kwp} kWp</li>
              <li>Paneles: ${datos.kit.paneles} unidades</li>
              <li>Inversor: ${datos.kit.inversorKw} kW</li>
              <li>Instalación en: ${datos.tipoTecho}</li>
            </ul>
            <p style="font-size: 20px; color: #F07E04;"><strong>Total: $${datos.precioFinal.toLocaleString('es-CL')}</strong></p>
          </div>
          
          <p>Un ejecutivo te contactará pronto.</p>
        </div>
      `,
    });
*/
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error enviando email:', err);
    // No lanzamos el error para que la API responda 200 aunque falle el mail (el lead ya se guardó)
  }
}