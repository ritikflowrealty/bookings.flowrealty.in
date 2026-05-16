import crypto from 'node:crypto';
import { ensureSchema, getDb, rowsAs, type BookingRow } from './db';

export const MAX_RETRIES = 3;

export function generateReference(): string {
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

export async function createBooking(input: CreateBookingInput): Promise<BookingRow> {
  await ensureSchema();
  const reference = generateReference();
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO bookings (
      reference_number, project_id, full_name, email, mobile, tower_unit, amount,
      address, city, pincode, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending') RETURNING *`,
    args: [
      reference,
      input.project_id,
      input.full_name,
      input.email,
      input.mobile,
      input.tower_unit,
      input.amount,
      input.address || '',
      input.city || '',
      input.pincode || '',
    ],
  });
  const row = rowsAs<BookingRow>(result)[0];
  if (!row) throw new Error('Booking insert returned no row');
  return row;
}

export async function getBookingById(id: number): Promise<BookingRow | null> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: `SELECT * FROM bookings WHERE id = ?`,
    args: [id],
  });
  return rowsAs<BookingRow>(result)[0] || null;
}

export async function getBookingByReference(ref: string): Promise<BookingRow | null> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: `SELECT * FROM bookings WHERE reference_number = ?`,
    args: [ref],
  });
  return rowsAs<BookingRow>(result)[0] || null;
}

export async function attachOrder(bookingId: number, orderId: string): Promise<void> {
  await getDb().execute({
    sql: `UPDATE bookings SET razorpay_order_id = ?, status = 'created', updated_at = datetime('now') WHERE id = ?`,
    args: [orderId, bookingId],
  });
}

export async function markPaid(
  bookingId: number,
  paymentId: string,
  signature: string
): Promise<void> {
  await getDb().execute({
    sql: `UPDATE bookings
          SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'paid', updated_at = datetime('now')
          WHERE id = ?`,
    args: [paymentId, signature, bookingId],
  });
}

export async function markFailed(bookingId: number, reason: string): Promise<void> {
  await getDb().execute({
    sql: `UPDATE bookings
          SET status = 'failed', failure_reason = ?, retry_count = retry_count + 1, updated_at = datetime('now')
          WHERE id = ?`,
    args: [reason, bookingId],
  });
}
