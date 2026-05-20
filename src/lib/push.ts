/**
 * Web Push helper.
 *
 * VAPID keys come from env:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT (e.g. mailto:hello@flowrealty.in)
 *
 * Generate keys once with:
 *   npx web-push generate-vapid-keys
 */
import webpush from 'web-push';
import { ensureSchema, getDb, rowsAs } from './db';

let _configured = false;
function configure() {
  if (_configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:hello@flowrealty.in';
  if (!pub || !priv) {
    console.warn('[push] VAPID keys not set; push notifications will be skipped');
    return;
  }
  webpush.setVapidDetails(subject, pub, priv);
  _configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
};

export type Portal = 'cp' | 'developer' | 'customer' | 'admin';

type SubRow = { id: number; endpoint: string; p256dh: string; auth: string };

async function getSubscriptions(portal: Portal, userId: number | null): Promise<SubRow[]> {
  await ensureSchema();
  const sql = userId
    ? `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE portal = ? AND user_id = ?`
    : `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE portal = ?`;
  const r = await getDb().execute({
    sql,
    args: userId ? [portal, userId] : [portal],
  });
  return rowsAs<SubRow>(r);
}

export async function sendToCustomerOrAdmin(portal: Portal, userId: number | null, payload: PushPayload): Promise<void> {
  configure();
  if (!_configured) return;
  const subs = await getSubscriptions(portal, userId);
  if (subs.length === 0) return;

  const json = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/',
    tag: payload.tag,
    icon: payload.icon || '/favicon.png',
  });

  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        json,
      );
    } catch (err: any) {
      // Stale subscription — clean up
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        await getDb().execute({
          sql: `DELETE FROM push_subscriptions WHERE id = ?`,
          args: [s.id],
        });
      } else {
        console.error('[push] send failed:', err?.statusCode, err?.body || err?.message);
      }
    }
  }));
}
