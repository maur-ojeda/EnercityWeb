import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');

  let query = supabaseAdmin
    .from('leads')
    .select('id, nombre, email, telefono, estado, notas, created_at, updated_at, monto_boleta_ingresado, precio_final_iva, comunas(nombre), precios_kits(consumo_bruto, paneles, kwp)')
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

  type LeadRow = {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    estado: string;
    notas: string | null;
    created_at: string;
    updated_at: string | null;
    monto_boleta_ingresado: number;
    precio_final_iva: number;
    comunas: { nombre: string } | null;
    precios_kits: { consumo_bruto: number; paneles: number; kwp: number } | null;
  };

  const leads = (data ?? []) as unknown as LeadRow[];

  const headers = [
    'ID',
    'Nombre',
    'Email',
    'Teléfono',
    'Estado',
    'Comuna',
    'Kit (kWp)',
    'Paneles',
    'Consumo Bruto',
    'Boleta',
    'Precio Final IVA',
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

  const formatCLP = (value: number | null): string => {
    if (value === null || value === undefined) return '';
    return '$' + value.toLocaleString('es-CL');
  };

  const rows = leads.map((lead) =>
    [
      escapeCSV(lead.id),
      escapeCSV(lead.nombre),
      escapeCSV(lead.email),
      escapeCSV(lead.telefono),
      escapeCSV(lead.estado),
      escapeCSV(lead.comunas?.nombre),
      escapeCSV(lead.precios_kits?.kwp?.toString()),
      escapeCSV(lead.precios_kits?.paneles?.toString()),
      escapeCSV(lead.precios_kits?.consumo_bruto?.toString()),
      formatCLP(lead.monto_boleta_ingresado),
      formatCLP(lead.precio_final_iva),
      escapeCSV(lead.notas),
      escapeCSV(lead.created_at),
    ].join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const filename = `leads_${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};