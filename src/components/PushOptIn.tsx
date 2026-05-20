'use client';

import { useEffect, useState } from 'react';

type Portal = 'cp' | 'developer' | 'customer';

/**
 * Tiny opt-in card. Mounted on each portal dashboard. Asks the user to allow
 * browser notifications, registers the service worker, subscribes, and posts
 * the subscription to the server. Hides itself once subscribed or denied.
 */
export function PushOptIn({ portal }: { portal: Portal }) {
  const [state, setState] = useState<'unknown' | 'unsupported' | 'granted' | 'denied' | 'default' | 'subscribing' | 'subscribed'>('unknown');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    setState(Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'default');
    // Check existing subscription
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        const sub = reg?.pushManager ? await reg.pushManager.getSubscription() : null;
        if (sub) setState('subscribed');
      } catch {
        // ignore
      }
    })();
  }, []);

  async function subscribe() {
    setError(null);
    setState('subscribing');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission as 'denied' | 'default');
        return;
      }
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setError('Push not configured.');
        setState('default');
        return;
      }

      const existing = await reg.pushManager.getSubscription();
      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const payload = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      const r = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal,
          endpoint: payload.endpoint,
          p256dh: payload.keys?.p256dh,
          auth: payload.keys?.auth,
        }),
      });
      if (!r.ok) {
        setError('Could not register subscription.');
        setState('default');
        return;
      }
      setState('subscribed');
    } catch (err: any) {
      setError(err?.message || 'Could not enable notifications.');
      setState('default');
    }
  }

  if (state === 'unsupported' || state === 'subscribed' || state === 'granted' && !error) return null;
  if (state === 'denied') {
    return (
      <div className="glass rounded-2xl p-4 text-sm text-ink-muted">
        Notifications are blocked. Enable them from your browser settings to get alerts here.
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="font-medium">Get push notifications</p>
        <p className="text-xs text-ink-muted mt-0.5">We&rsquo;ll alert you when something important happens — no email, no SMS.</p>
      </div>
      <button
        onClick={subscribe}
        disabled={state === 'subscribing'}
        className="btn-neon text-sm py-2"
      >
        {state === 'subscribing' ? 'Asking…' : 'Enable notifications'}
      </button>
      {error && <p className="text-xs text-neon-pink basis-full">{error}</p>}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf;
}
