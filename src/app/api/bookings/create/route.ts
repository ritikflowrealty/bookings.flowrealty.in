import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug } from '@/lib/projects';
import { createBooking, attachOrder } from '@/lib/bookings';
import { validateBookingPayload, sanitizeText } from '@/lib/validation';
import { createRazorpayOrder } from '@/lib/razorpay';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 10_000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const slug = sanitizeText(body.project_slug, 80);
    const project = await getProjectBySlug(slug);
    if (!project || !project.is_visible || !project.booking_enabled) {
      return NextResponse.json(
        { ok: false, message: 'Project is not available for booking.' },
        { status: 404 }
      );
    }
    if (!project.payment_enabled || !project.razorpay_active) {
      return NextResponse.json(
        { ok: false, message: 'Payments are temporarily unavailable for this project.' },
        { status: 409 }
      );
    }
    if (!project.razorpay_key_id || !project.razorpay_key_secret) {
      return NextResponse.json(
        { ok: false, message: 'Razorpay is not configured for this project.' },
        { status: 409 }
      );
    }

    const v = validateBookingPayload(body);
    if (!v.ok) {
      return NextResponse.json(
        { ok: false, field: v.field, message: v.message },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      project_id: project.id,
      full_name: sanitizeText(body.full_name, 120),
      email: sanitizeText(body.email, 200),
      mobile: sanitizeText(body.mobile, 10),
      tower_unit: sanitizeText(body.tower_unit, 50),
      amount: Number(body.amount),
      address: sanitizeText(body.address, 300),
      city: sanitizeText(body.city, 80),
      pincode: sanitizeText(body.pincode, 6),
    });

    const orderPromise = createRazorpayOrder({
      keyId: project.razorpay_key_id,
      keySecret: project.razorpay_key_secret,
      amountInRupees: booking.amount,
      receipt: booking.reference_number,
      notes: {
        reference_number: booking.reference_number,
        project: project.name,
        developer: project.developer,
        city: project.city,
        tower_unit: booking.tower_unit,
        full_name: booking.full_name,
        email: booking.email,
        mobile: booking.mobile,
      },
    });

    const order = (await Promise.race([
      orderPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Razorpay timeout')), TIMEOUT_MS)
      ),
    ])) as { id: string; amount: number };

    await attachOrder(booking.id, order.id);
    await audit('booking.created', {
      booking_id: booking.id,
      reference: booking.reference_number,
      project_id: project.id,
      amount: booking.amount,
    });

    return NextResponse.json({
      ok: true,
      booking_id: booking.id,
      reference_number: booking.reference_number,
      order_id: order.id,
      amount_paise: order.amount,
      razorpay_key_id: project.razorpay_key_id,
    });
  } catch (err: any) {
    const detail =
      err?.error?.description ||
      err?.message ||
      (typeof err === 'string' ? err : JSON.stringify(err));
    await audit('booking.error', { message: detail });
    const message =
      detail === 'Razorpay timeout'
        ? 'Payment provider did not respond. Please try again.'
        : err?.statusCode === 401
          ? 'Razorpay credentials for this project are invalid. Please contact support.'
          : 'Could not create booking. Please try again.';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
