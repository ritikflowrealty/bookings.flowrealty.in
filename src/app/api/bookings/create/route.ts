import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug } from '@/lib/projects';
import { createBooking, attachOrder } from '@/lib/bookings';
import { validateBookingPayload, sanitizeText } from '@/lib/validation';
import { createRazorpayOrder } from '@/lib/razorpay';
import { createCashfreeOrder } from '@/lib/cashfree';
import { buildPayuFormPayload } from '@/lib/payu';
import { audit } from '@/lib/audit';
import { notifyGallabox, buildUsRecipients } from '@/lib/gallabox';
import { getSettings, setting } from '@/lib/settings';

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
    if (!project.payment_enabled) {
      return NextResponse.json(
        { ok: false, message: 'Payments are temporarily unavailable for this project.' },
        { status: 409 }
      );
    }

    const provider = project.payment_provider || 'razorpay';

    // Validate provider credentials
    if (provider === 'razorpay') {
      if (!project.razorpay_active || !project.razorpay_key_id || !project.razorpay_key_secret) {
        return NextResponse.json(
          { ok: false, message: 'Razorpay is not configured for this project.' },
          { status: 409 }
        );
      }
    } else if (provider === 'cashfree') {
      if (!project.cashfree_active || !project.cashfree_app_id || !project.cashfree_secret_key) {
        return NextResponse.json(
          { ok: false, message: 'Cashfree is not configured for this project.' },
          { status: 409 }
        );
      }
    } else if (provider === 'payu') {
      if (!project.payu_active || !project.payu_merchant_key || !project.payu_salt) {
        return NextResponse.json(
          { ok: false, message: 'PayU is not configured for this project.' },
          { status: 409 }
        );
      }
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

    const notes = {
      reference_number: booking.reference_number,
      project: project.name,
      developer: project.developer,
      city: project.city,
      tower_unit: booking.tower_unit,
      full_name: booking.full_name,
      email: booking.email,
      mobile: booking.mobile,
    };

    // WhatsApp via Gallabox — fan out to customer + developer + us
    // (CP isn't known at booking-create time on the public booking flow;
    // CP-driven leads use a separate path in /api/cp/leads.)
    void (async () => {
      try {
        const s = await getSettings();
        const us = buildUsRecipients(setting(s, 'internal_whatsapp_numbers', ''));
        await notifyGallabox({
          project,
          event: {
            event: 'booking.created',
            title: 'Booking initiated',
            data: {
              reference: booking.reference_number,
              tower_unit: booking.tower_unit,
              amount: booking.amount,
              provider,
              customer_name: booking.full_name,
              customer_phone: booking.mobile,
              customer_email: booking.email,
            },
          },
          recipients: [
            { role: 'customer', phone: booking.mobile, name: booking.full_name },
            { role: 'developer', phone: project.developer_whatsapp, name: project.developer },
            ...us,
          ],
        });
      } catch (err: any) {
        console.error('[gallabox] booking.created notify failed:', err?.message || err);
      }
    })();

    if (provider === 'razorpay') {
      const orderPromise = createRazorpayOrder({
        keyId: project.razorpay_key_id,
        keySecret: project.razorpay_key_secret,
        amountInRupees: booking.amount,
        receipt: booking.reference_number,
        notes,
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
        provider: 'razorpay',
      });

      return NextResponse.json({
        ok: true,
        provider: 'razorpay',
        booking_id: booking.id,
        reference_number: booking.reference_number,
        order_id: order.id,
        amount_paise: order.amount,
        razorpay_key_id: project.razorpay_key_id,
      });
    } else if (provider === 'cashfree') {
      // Cashfree
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://booking.flowrealty.in';
      const returnUrl = `${siteUrl}/booking/cashfree-return?ref=${encodeURIComponent(booking.reference_number)}`;

      const cfOrder = await createCashfreeOrder({
        appId: project.cashfree_app_id,
        secretKey: project.cashfree_secret_key,
        mode: project.cashfree_mode || 'test',
        orderId: booking.reference_number,
        amountInRupees: booking.amount,
        customerName: booking.full_name,
        customerEmail: booking.email,
        customerPhone: booking.mobile,
        returnUrl,
        notes,
      });

      await attachOrder(booking.id, cfOrder.orderId);
      await audit('booking.created', {
        booking_id: booking.id,
        reference: booking.reference_number,
        project_id: project.id,
        amount: booking.amount,
        provider: 'cashfree',
      });

      return NextResponse.json({
        ok: true,
        provider: 'cashfree',
        booking_id: booking.id,
        reference_number: booking.reference_number,
        order_id: cfOrder.orderId,
        payment_session_id: cfOrder.paymentSessionId,
        cashfree_mode: project.cashfree_mode || 'test',
      });
    } else {
      // PayU — form-post redirect flow
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://booking.flowrealty.in';
      const surl = `${siteUrl}/api/bookings/payu-callback`;
      const furl = `${siteUrl}/api/bookings/payu-callback`;

      const payload = buildPayuFormPayload({
        merchantKey: project.payu_merchant_key,
        salt: project.payu_salt,
        mode: project.payu_mode || 'test',
        txnid: booking.reference_number,
        amountInRupees: booking.amount,
        productInfo: `${project.name} - ${booking.tower_unit}`.slice(0, 100),
        firstName: booking.full_name.split(' ')[0] || booking.full_name,
        lastName: booking.full_name.split(' ').slice(1).join(' '),
        email: booking.email,
        phone: booking.mobile,
        address1: booking.address,
        city: booking.city,
        zipcode: booking.pincode,
        country: 'India',
        surl,
        furl,
        notes,
      });

      await attachOrder(booking.id, booking.reference_number);
      await audit('booking.created', {
        booking_id: booking.id,
        reference: booking.reference_number,
        project_id: project.id,
        amount: booking.amount,
        provider: 'payu',
      });

      return NextResponse.json({
        ok: true,
        provider: 'payu',
        booking_id: booking.id,
        reference_number: booking.reference_number,
        payu_url: payload.url,
        payu_fields: payload.fields,
      });
    }
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
          ? 'Payment credentials for this project are invalid. Please contact support.'
          : 'Could not create booking. Please try again.';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
