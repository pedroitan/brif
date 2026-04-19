import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Expõe o pathname atual em um header para os layouts/server components
// (Next 14 não entrega o pathname direto para layouts).
export default withAuth((req) => {
  const res = NextResponse.next();
  res.headers.set('x-pathname', req.nextUrl.pathname);
  return res;
});

export const config = {
  matcher: ['/projetos/:path*'],
};
