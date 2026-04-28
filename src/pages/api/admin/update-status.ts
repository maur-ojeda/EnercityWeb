import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const prerender = false;

const VALID_LEAD_STATUSES = ['nuevo', 'contactado', 'calificado', 'cerrado'] as const;
const VALID_CONTACT_STATUSES = ['nuevo', 'contactado', 'cerrado'] as const;

type LeadStatus = (typeof VALID_LEAD_STATUSES)[number];
type ContactStatus = (typeof VALID_CONTACT_STATUSES)[number];

export const POST: APIRoute = async ({ request }) => {
  let body: {
    id?: string;
    status?: string;
    notas?: string;
    table?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id, status, notas, table } = body;

  if (!id || !status || !table) {
    return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (table !== 'leads' && table !== 'contacts') {
    return new Response(JSON.stringify({ error: 'Tabla inválida' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (table === 'leads' && !VALID_LEAD_STATUSES.includes(status as LeadStatus)) {
    return new Response(JSON.stringify({ error: 'Estado inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (table === 'contacts' && !VALID_CONTACT_STATUSES.includes(status as ContactStatus)) {
    return new Response(JSON.stringify({ error: 'Estado inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const updateData: Record<string, unknown> = { estado: status };
  if (notas !== undefined) updateData.notas = notas;

  const { error } = await supabaseAdmin
    .from(table)
    .update(updateData)
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};