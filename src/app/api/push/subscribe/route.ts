import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureSchema, getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, message: 'Sign in required.' }, { status: 401 });
  }
  await ensureSchema();
  const body = await req.json();
  const { portal, endpoint, p256dh, auth: authKey } = body || {};
  if (!['cp', 'developer', 'customer'].includes(portal)) {
    return NextResponse.json({ ok: false, message: 'Bad portal.' }, { status: 400 });
  }
  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ ok: false, message: 'Bad subscription payload.' }, { status: 400 });
  }
  // Confirm session has the matching portal access
  if (!session.portals?.includes(portal)) {
    return NextResponse.json({ ok: false, message: 'Not authorised for this portal.' }, { status: 403 });
  }
  const userId =
    portal === 'cp' ? session.cpId :
    portal === 'developer' ? session.developerId :
    session.customerId;

  const db = getDb();
  await db.execute({
    sql: `INSERT INTO push_subscriptions (endpoint, p256dh, auth, portal, user_id, email, user_agent)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(endpoint) DO UPDATE SET
            p256dh = excluded.p256dh,
            auth = excluded.auth,
            portal = excluded.portal,
            user_id = excluded.user_id,
            email = excluded.email,
            user_agent = excluded.user_agent,
            last_seen_at = datetime('now')`,
    args: [
      endpoint, p256dh, authKey, portal, userId || null,
      session.user.email.toLowerCase(),
      req.headers.get('user-agent') || '',
    ],
  });
  return NextResponse.json({ ok: true });
}
