import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { sendContactEmails } from '../../lib/email';
import { z } from 'zod';

export const prerender = false;

const contactSchema = z.object({
  nombre: z.string().min(3, 'Nombre demasiado corto').transform(v => v.trim().slice(0, 255)),
  email: z.string().email('Email inválido').transform(v => v.trim().slice(0, 255)),
  telefono: z.string().optional().transform(v => v?.trim().slice(0, 50) || undefined),
  proyecto: z.enum(['residencial', 'industrial', 'agricola'], { errorMap: () => ({ message: 'Proyecto inválido' }) }),
  mensaje: z.string().optional().transform(v => v?.trim().slice(0, 2000) || undefined),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return new Response(JSON.stringify({ error: firstError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { nombre, email, telefono, proyecto, mensaje } = parsed.data;

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        nombre,
        email,
        telefono: telefono || null,
        proyecto,
        mensaje: mensaje || null,
        estado: 'nuevo',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting contact:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[API] Contacto creado: ${email}`);

    try {
      await sendContactEmails({
        nombre,
        email,
        telefono,
        proyecto,
        mensaje,
      });
    } catch (emailError) {
      console.error('[Email] Fallo en envio (no bloquea respuesta):', emailError);
    }

    return new Response(JSON.stringify({ success: true, contact: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error processing contact:', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};