import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyOtp, PORTAL_COOKIE, type Portal } from '@/lib/portal-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { portal, email, code } = await req.json();
    if (!['cp', 'developer', 'customer'].includes(portal)) {
      return NextResponse.json({ ok: false, message: 'Bad portal.' }, { status: 400 });
    }
    const out = await verifyOtp({
      portal,
      email: String(email || ''),
      code: String(code || ''),
      ip: req.headers.get('x-forwarded-for') || '',
    });
    if (!out.ok || !out.token) {
      return NextResponse.json({ ok: false, message: out.message || 'Invalid code.' }, { status: 400 });
    }
    const cookieName = PORTAL_COOKIE[portal as Portal];
    const cookieStore = await cookies();
    cookieStore.set(cookieName, out.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: 'Server error.' }, { status: 500 });
  }
}
