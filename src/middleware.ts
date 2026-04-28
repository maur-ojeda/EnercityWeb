import { defineMiddleware } from 'astro:middleware';
import { getAdminUser } from '@/lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      const user = await getAdminUser(context.request);
      if (user) {
        return context.redirect('/admin');
      }
      return next();
    }

    const user = await getAdminUser(context.request);
    if (!user) {
      return context.redirect('/admin/login');
    }

    context.locals.adminUser = user;
  }

  return next();
});