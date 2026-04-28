import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { clearSettingsCache } from '@/lib/settings';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: { key?: string; value?: string; settings?: Array<{ key: string; value: string }> };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let updates: Array<{ key: string; value: string }>;

  if (body.settings && Array.isArray(body.settings)) {
    updates = body.settings;
  } else if (body.key && body.value !== undefined) {
    updates = [{ key: body.key, value: body.value }];
  } else {
    return new Response(JSON.stringify({ error: 'Faltan campos requeridos: { settings } o { key, value }' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  for (const update of updates) {
    if (!update.key || update.value === undefined) {
      return new Response(JSON.stringify({ error: `Entrada inválida: key="${update.key}"` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const results = await Promise.all(
    updates.map((update) =>
      supabaseAdmin
        .from('settings')
        .update({ value: update.value })
        .eq('key', update.key)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed && failed.error) {
    return new Response(JSON.stringify({ error: failed.error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  clearSettingsCache();

  return new Response(JSON.stringify({ success: true, updated: updates.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};