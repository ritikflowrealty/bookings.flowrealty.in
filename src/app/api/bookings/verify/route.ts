import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, markPaid, markFailed } from '@/lib/bookings';
import { getProjectById } from '@/lib/projects';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bookingId = Number(body.booking_id);
    const orderId = String(body.razorpay_order_id || '');
    const paymentId = String(body.razorpay_payment_id || '');
    const signature = String(body.razorpay_signature || '');

    if (!bookingId || !orderId || !paymentId || !signature) {
      return NextResponse.json({ ok: false, message: 'Missing fields.' }, { status: 400 });
    }

    const booking = getBookingById(bookingId);
    if (!booking) return NextResponse.json({ ok: false, message: 'Booking not found.' }, { status: 404 });
    if (booking.razorpay_order_id !== orderId) {
      return NextResponse.json({ ok: false, message: 'Order mismatch.' }, { status: 400 });
    }

    const project = getProjectById(booking.project_id);
    if (!project || !project.razorpay_key_secret) {
      return NextResponse.json({ ok: false, message: 'Project not configured.' }, { status: 409 });
    }

    const valid = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
      keySecret: project.razorpay_key_secret,
    });
    if (!valid) {
      markFailed(bookingId, 'Invalid signature');
      audit('booking.signature_invalid', { booking_id: bookingId });
      return NextResponse.json({ ok: false, message: 'Invalid signature.' }, { status: 400 });
    }

    markPaid(bookingId, paymentId, signature);
    audit('booking.paid', {
      booking_id: bookingId,
      reference: booking.reference_number,
      payment_id: paymentId,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    audit('booking.verify_error', { message: err?.message || String(err) });
    return NextResponse.json({ ok: false, message: 'Verification failed.' }, { status: 500 });
  }
}
