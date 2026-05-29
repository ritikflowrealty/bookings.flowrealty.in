/**
 * Gallabox Generic Webhook helper — per-project WhatsApp fan-out.
 *
 * One project carries one webhook URL (its secret), and a single event can
 * notify up to four roles: customer, developer, channel partner, and the
 * internal team ("us"). For each recipient we POST one JSON object to the
 * project's webhook with a `role` field; the Gallabox workflow branches on
 * `role` to select the right WhatsApp template and sends to `recipient_phone`.
 *
 * Design rules:
 * - **Fail-soft.** Network errors, missing config, bad numbers — none of it
 *   propagates back to the caller. Notification is best-effort. Wrap calls
 *   with `void notifyGallabox(...)` to fire-and-forget.
 * - **Per-project gated.** If a project has `gallabox_active=0` or no
 *   `gallabox_webhook_url`, the helper exits without sending anything.
 * - **Number sanitisation.** We strip everything non-digit and prepend `91`
 *   if the result is a 10-digit number, so callers can pass `+91 98765 ...`,
 *   `9876543210`, or `919876543210` interchangeably.
 */

import type { ProjectRow } from './db';

export type GallaboxRole = 'customer' | 'developer' | 'cp' | 'us';

export type GallaboxRecipient = {
  role: GallaboxRole;
  phone: string;
  name?: string;
};

/**
 * Canonical event payload sent to Gallabox. Anything not core to the
 * notification lives in `data` (a flat record mapped to template variables in
 * the Gallabox workflow). The helper layers `role`, `recipient_*` and the
 * project metadata on top automatically — callers just describe the event.
 */
export type GallaboxEvent = {
  event: string; // e.g. 'booking.paid', 'invoice.approved'
  title: string; // short human label, useful for logs / templates
  data?: Record<string, string | number | null | undefined>;
};

const HTTP_TIMEOUT_MS = 6000;

/**
 * Convert any Indian-format mobile string to `91XXXXXXXXXX`. Returns empty
 * string for anything we can't make sense of so the caller can drop it.
 */
export function normaliseIndianPhone(input: string | null | undefined): string {
  if (!input) return '';
  const digits = String(input).replace(/\D+/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  // International or already-prefixed numbers: trust the caller, return as-is
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return '';
}

/** Parse a comma- or newline-separated phone list (used for the team setting). */
export function parsePhoneList(input: string | null | undefined): string[] {
  if (!input) return [];
  return String(input)
    .split(/[,\n;]+/)
    .map((s) => normaliseIndianPhone(s.trim()))
    .filter(Boolean);
}

/**
 * Send the actual HTTP POST to the project's Gallabox webhook. Treats
 * everything as best-effort — a thrown error is caught and logged.
 */
async function postToGallabox(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      console.error('[gallabox] webhook returned non-2xx', r.status, body.slice(0, 200));
    }
  } catch (err: any) {
    console.error('[gallabox] webhook failed:', err?.message || err);
  } finally {
    clearTimeout(timer);
  }
}

type ProjectLike = Pick<
  ProjectRow,
  | 'id'
  | 'slug'
  | 'name'
  | 'developer'
  | 'city'
  | 'gallabox_webhook_url'
  | 'gallabox_active'
  | 'developer_whatsapp'
>;

/**
 * Fan-out a single event to up to four WhatsApp recipients tied to the
 * given project. No-op when Gallabox isn't configured or the project has
 * `gallabox_active=0`. Safe to `void`.
 */
export async function notifyGallabox(args: {
  project: ProjectLike;
  event: GallaboxEvent;
  recipients: Array<Partial<GallaboxRecipient>>;
}): Promise<void> {
  const { project, event, recipients } = args;
  if (!project) return;
  if (!project.gallabox_active) return;
  const url = (project.gallabox_webhook_url || '').trim();
  if (!url) return;

  const baseData = {
    event: event.event,
    title: event.title,
    project_id: project.id,
    project_slug: project.slug,
    project_name: project.name,
    project_developer: project.developer,
    project_city: project.city,
    timestamp: new Date().toISOString(),
    ...(event.data || {}),
  };

  const sends: Promise<void>[] = [];
  for (const r of recipients) {
    if (!r.role) continue;
    const phone = normaliseIndianPhone(r.phone || '');
    if (!phone) continue;

    sends.push(
      postToGallabox(url, {
        ...baseData,
        role: r.role,
        recipient_phone: phone,
        recipient_name: (r.name || '').slice(0, 120),
      })
    );
  }

  // Run all role sends in parallel; await so the caller's `void` covers them
  // all but a single slow recipient never holds up the others.
  await Promise.allSettled(sends);
}

/**
 * Convenience: read the comma-separated `internal_whatsapp_numbers` setting
 * and return [{role:'us', phone}, ...] for use with `notifyGallabox`.
 * Returns [] when the setting is empty.
 */
export function buildUsRecipients(
  internalSetting: string | null | undefined
): Array<{ role: 'us'; phone: string; name: string }> {
  return parsePhoneList(internalSetting).map((phone) => ({
    role: 'us',
    phone,
    name: 'Flow Realty Ops',
  }));
}
