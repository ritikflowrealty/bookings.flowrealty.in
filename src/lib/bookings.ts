import crypto from 'node:crypto';
import { getDb, type BookingRow } from './db';

export const MAX_RETRIES = 3;

export function generateReference(): string {
  // FR-YYYYMMDD-XXXXXX
  const d = new Date();
  const datePart = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(
    d.getUTCDate()
  ).padStart(2, '0')}`;
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `FR-${datePart}-${rand}`;
}

export type CreateBookingInput = {
  project_id: number;
  full_name: string;
  email: string;
  mobile: string;
  tower_unit: string;
  amount: number;
  address?: string;
  city?: string;
  pincode?: string;
};

export function createBooking(input: CreateBookingInput): BookingRow {
  const reference = generateReference();
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO bookings (
      reference_number, project_id, full_name, email, mobile, tower_unit, amount,
      address, city, pincode, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `);
  const result = stmt.run(
    reference,
    input.project_id,
    input.full_name,
    input.email,
    input.mobile,
    input.tower_unit,
    input.amount,
    input.address || '',
    input.city || '',
    input.pincode || ''
  );
  return getBookingById(Number(result.lastInsertRowid))!;
}

export function getBookingById(id: number): BookingRow | null {
  const row = getDb().prepare(`SELECT * FROM bookings WHERE id = ?`).get(id) as
    | BookingRow
    | undefined;
  return row || null;
}

export function getBookingByReference(ref: string): BookingRow | null {
  const row = getDb().prepare(`SELECT * FROM bookings WHERE reference_number = ?`).get(ref) as
    | BookingRow
    | undefined;
  return row || null;
}

export function attachOrder(bookingId: number, orderId: string) {
  getDb()
    .prepare(
      `UPDATE bookings SET razorpay_order_id = ?, status = 'created', updated_at = datetime('now') WHERE id = ?`
    )
    .run(orderId, bookingId);
}

export function markPaid(
  bookingId: number,
  paymentId: string,
  signature: string
) {
  getDb()
    .prepare(
      `UPDATE bookings
       SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'paid', updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(paymentId, signature, bookingId);
}

export function markFailed(bookingId: number, reason: string) {
  getDb()
    .prepare(
      `UPDATE bookings
       SET status = 'failed', failure_reason = ?, retry_count = retry_count + 1, updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(reason, bookingId);
}
