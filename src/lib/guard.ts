import { NextRequest, NextResponse } from 'next/server';
import { bearerFromHeader, isValidSession } from './auth';

/**
 * Returns null if authorized, otherwise a 401 NextResponse to return.
 */
export function guardAdmin(req: NextRequest): NextResponse | null {
  const token = bearerFromHeader(req.headers.get('authorization'));
  if (!isValidSession(token)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  return null;
}
