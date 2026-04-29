import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { error } = await supabaseAdmin
      .from('settings')
      .select('id')
      .limit(1);

    if (error) throw error;

    return new Response(
      JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ status: 'error', error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};