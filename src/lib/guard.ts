import { NextRequest, NextResponse } from 'next/server';
import { bearerFromHeader, isValidSession } from './auth';

/**
 * Returns null if authorized, otherwise a 401 NextResponse to return.
 */
export async function guardAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = bearerFromHeader(req.headers.get('authorization'));
  const ok = await isValidSession(token);
  if (!ok) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  return null;
}
