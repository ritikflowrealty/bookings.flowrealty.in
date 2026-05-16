import { NextRequest, NextResponse } from 'next/server';
import { bearerFromHeader, isValidSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = bearerFromHeader(req.headers.get('authorization'));
  return NextResponse.json({ ok: isValidSession(token) });
}
