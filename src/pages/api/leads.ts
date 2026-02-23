import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { sendQuoteEmail } from '../../lib/email';
import type { LeadInput } from '../../types/simulation';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(str: string): string {
  return str.trim().slice(0, 255);
}

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: LeadInput = await request.json();

    let { nombre, email, telefono, comunaId, montoBoletaIngresado, kitId, factorTechoAplicado, costoFijoMedidorAplicado, precioFinalIva } = body;

    if (!nombre || !email || !kitId || precioFinalIva === undefined) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    nombre = sanitizeString(nombre);
    email = sanitizeString(email);
    telefono = telefono ? sanitizeString(telefono) : '';

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ error: 'Email invalido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (precioFinalIva <= 0) {
      return new Response(JSON.stringify({ error: 'Precio final invalido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: kitData } = await supabase
      .from('precios_kits')
      .select('*')
      .eq('id', kitId)
      .single();

    if (!kitData) {
      return new Response(JSON.stringify({ error: 'Kit no valido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        nombre,
        email,
        telefono: telefono || null,
        comuna_id: comunaId || null,
        monto_boleta_ingresado: montoBoletaIngresado,
        kit_id: kitId,
        factor_techo_aplicado: factorTechoAplicado,
        costo_fijo_medidor_aplicado: costoFijoMedidorAplicado,
        precio_final_iva: precioFinalIva,
        estado: 'nuevo'
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting lead:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[API] Lead creado: ${email}`);

    await sendQuoteEmail({
      to: email,
      nombre,
      datos: {
        kit: {
          kwp: Number(kitData.kwp),
          paneles: kitData.paneles,
          inversorKw: Number(kitData.inversor_kw),
        },
        tipoTecho: factorTechoAplicado === 1.14 ? 'Teja Chilena' : 'Losa/Otro',
        tipoMedidor: costoFijoMedidorAplicado > 0 ? 'Reja/Fuera' : 'Normal',
        precioFinal: precioFinalIva,
        montoBoleta: montoBoletaIngresado,
      },
    });

    console.log(`[API] Email enviado a: ${email}`);

    return new Response(JSON.stringify({ success: true, lead: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error processing lead:', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
