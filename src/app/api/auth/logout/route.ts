import { NextRequest, NextResponse } from 'next/server';
import { bearerFromHeader, destroySession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = bearerFromHeader(req.headers.get('authorization'));
  if (token) destroySession(token);
  return NextResponse.json({ ok: true });
}
