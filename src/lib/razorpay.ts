/**
 * Razorpay helpers. Each project carries its own key/secret in the DB, so this
 * module always takes credentials as arguments rather than reading globals.
 */
import crypto from 'node:crypto';
import Razorpay from 'razorpay';

export type CreateOrderArgs = {
  keyId: string;
  keySecret: string;
  amountInRupees: number;
  receipt: string;
  notes: Record<string, string | number>;
};

export async function createRazorpayOrder(args: CreateOrderArgs) {
  if (!args.keyId || !args.keySecret) {
    throw new Error('Razorpay credentials missing for this project.');
  }
  const client = new Razorpay({
    key_id: args.keyId,
    key_secret: args.keySecret,
  });

  const order = await client.orders.create({
    amount: Math.round(args.amountInRupees * 100), // paise
    currency: 'INR',
    receipt: args.receipt,
    notes: args.notes as Record<string, string>,
    payment_capture: true,
  });

  return order;
}

export function verifyRazorpaySignature(args: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  const expected = crypto
    .createHmac('sha256', args.keySecret)
    .update(`${args.orderId}|${args.paymentId}`)
    .digest('hex');
  // constant-time compare
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(args.signature || '', 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
