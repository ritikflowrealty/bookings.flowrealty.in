/**
 * Server-side validators. Used by both API routes and rendered forms.
 */

export type ValidationResult = { ok: true } | { ok: false; field: string; message: string };

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MOBILE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;

export function sanitizeText(input: unknown, max = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, max)
    // strip control chars except whitespace
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');
}

export function validateBookingPayload(p: Record<string, unknown>): ValidationResult {
  const fullName = sanitizeText(p.full_name, 120);
  if (fullName.length < 2) return { ok: false, field: 'full_name', message: 'Enter your full name.' };

  const email = sanitizeText(p.email, 200);
  if (!EMAIL_RE.test(email)) return { ok: false, field: 'email', message: 'Enter a valid email.' };

  const mobile = sanitizeText(p.mobile, 10);
  if (!MOBILE_RE.test(mobile))
    return { ok: false, field: 'mobile', message: 'Enter a 10-digit Indian mobile number.' };

  const towerUnit = sanitizeText(p.tower_unit, 50);
  if (towerUnit.length < 1)
    return { ok: false, field: 'tower_unit', message: 'Enter a preferred unit (e.g. A-102).' };

  const amount = Number(p.amount);
  if (!Number.isFinite(amount) || amount < 1)
    return { ok: false, field: 'amount', message: 'Enter a valid amount in INR.' };

  const pincode = sanitizeText(p.pincode, 6);
  if (pincode && !PIN_RE.test(pincode))
    return { ok: false, field: 'pincode', message: 'Pincode must be 6 digits.' };

  if (!p.terms_accepted)
    return {
      ok: false,
      field: 'terms_accepted',
      message: 'Please accept the booking terms.',
    };

  return { ok: true };
}
