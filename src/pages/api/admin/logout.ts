import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map((c) => c.trim());

  const clearCookies: string[] = [];

  for (const cookie of cookies) {
    const eqIndex = cookie.indexOf('=');
    if (eqIndex === -1) continue;
    const name = cookie.slice(0, eqIndex);
    if (name.startsWith('sb-') && name.endsWith('-auth-token')) {
      clearCookies.push(
        `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
      );
    }
  }

  const response = redirect('/admin/login', 302);
  response.headers.set('Set-Cookie', clearCookies.join(', '));

  return response;
};