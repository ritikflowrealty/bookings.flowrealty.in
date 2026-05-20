import { NextRequest, NextResponse } from 'next/server';
import { issueOtp } from '@/lib/portal-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { portal, email } = await req.json();
    if (!['cp', 'developer', 'customer'].includes(portal)) {
      return NextResponse.json({ ok: false, message: 'Bad portal.' }, { status: 400 });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: 'Enter a valid email.' }, { status: 400 });
    }
    const out = await issueOtp({
      portal,
      email,
      ip: req.headers.get('x-forwarded-for') || '',
    });
    return NextResponse.json(out);
  } catch {
    return NextResponse.json({ ok: false, message: 'Server error.' }, { status: 500 });
  }
}
