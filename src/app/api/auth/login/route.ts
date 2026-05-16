import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSession } from '@/lib/auth';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ ok: false, message: 'Password required.' }, { status: 400 });
    }
    if (!verifyPassword(password)) {
      audit('admin.login_failed', {}, { ip: req.headers.get('x-forwarded-for') || '' });
      return NextResponse.json({ ok: false, message: 'Incorrect password.' }, { status: 401 });
    }
    const session = createSession(req.headers.get('x-forwarded-for') || '');
    audit('admin.login_success', {});
    return NextResponse.json({ ok: true, token: session.token, expires_at: session.expiresAt });
  } catch {
    return NextResponse.json({ ok: false, message: 'Login error.' }, { status: 500 });
  }
}
