import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');

  let query = supabaseAdmin
    .from('contacts')
    .select('id, nombre, email, telefono, proyecto, mensaje, estado, notas, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('estado', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  type ContactRow = {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    proyecto: string;
    mensaje: string | null;
    estado: string;
    notas: string | null;
    created_at: string;
    updated_at: string | null;
  };

  const contacts = (data ?? []) as unknown as ContactRow[];

  const headers = [
    'ID',
    'Nombre',
    'Email',
    'Teléfono',
    'Proyecto',
    'Mensaje',
    'Estado',
    'Notas',
    'Fecha Creación',
  ];

  const escapeCSV = (value: string | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = contacts.map((contact) =>
    [
      escapeCSV(contact.id),
      escapeCSV(contact.nombre),
      escapeCSV(contact.email),
      escapeCSV(contact.telefono),
      escapeCSV(contact.proyecto),
      escapeCSV(contact.mensaje),
      escapeCSV(contact.estado),
      escapeCSV(contact.notas),
      escapeCSV(contact.created_at),
    ].join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const filename = `contactos_${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};