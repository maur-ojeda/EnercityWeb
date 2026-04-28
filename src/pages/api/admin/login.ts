import type { APIRoute } from 'astro';
import { signInAdmin, getAuthCookieName } from '@/lib/auth';

export const prerender = false;

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'Completá todos los campos',
  invalid_email: 'Email inválido',
};

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  let email: string;
  let password: string;

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    email = body.email?.trim();
    password = body.password;
  } else {
    const formData = await request.formData();
    email = (formData.get('email') as string)?.trim();
    password = formData.get('password') as string;
  }

  if (!email || !password) {
    return redirect('/admin/login?error=missing_fields', 302);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return redirect('/admin/login?error=invalid_email', 302);
  }

  const { session, error } = await signInAdmin(email, password);

  if (error || !session) {
    const encoded = encodeURIComponent(error || 'Error desconocido');
    return redirect(`/admin/login?error=${encoded}`, 302);
  }

  const cookieName = getAuthCookieName();
  const sessionValue = encodeURIComponent(JSON.stringify(session));

  cookies.set(cookieName, sessionValue, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return redirect('/admin', 302);
};