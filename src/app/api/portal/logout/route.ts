import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { destroySession, PORTAL_COOKIE, type Portal } from '@/lib/portal-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { portal } = await req.json().catch(() => ({}));
  const validPortal: Portal = ['cp', 'developer', 'customer'].includes(portal) ? portal : 'cp';
  const cookieName = PORTAL_COOKIE[validPortal];
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (token) await destroySession(token);
  store.set(cookieName, '', { path: '/', maxAge: 0 });
  return NextResponse.json({ ok: true });
}
