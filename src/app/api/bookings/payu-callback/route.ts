import { NextRequest, NextResponse } from 'next/server';
import { getBookingByReference, markPaid, markFailed } from '@/lib/bookings';
import { getProjectById } from '@/lib/projects';
import { verifyPayuResponseHash } from '@/lib/payu';
import { audit } from '@/lib/audit';
import { notifyGallabox, buildUsRecipients } from '@/lib/gallabox';
import { getSettings, setting } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PayU posts back to this endpoint after payment with form-encoded fields.
 * We verify the response hash, mark the booking, and 303-redirect the
 * browser to /booking/success.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body: Record<string, string> = {};
    for (const [k, v] of formData.entries()) {
      if (typeof v === 'string') body[k] = v;
    }

    const txnid = body.txnid || '';
    const status = (body.status || '').toLowerCase();
    const paymentId = body.mihpayid || body.payuMoneyId || '';

    if (!txnid) {
      return redirectTo('/');
    }

    const booking = await getBookingByReference(txnid);
    if (!booking) {
      await audit('booking.payu_unknown_ref', { txnid });
      return redirectTo('/');
    }

    const project = await getProjectById(booking.project_id);
    if (!project || !project.payu_merchant_key || !project.payu_salt) {
      await markFailed(booking.id, 'PayU project credentials missing on callback');
      return redirectTo(`/booking/success?ref=${encodeURIComponent(txnid)}`);
    }

    const validHash = verifyPayuResponseHash(body, project.payu_salt);

    if (!validHash) {
      await markFailed(booking.id, 'PayU hash verification failed');
      await audit('booking.payu_hash_invalid', { booking_id: booking.id, txnid });
      return redirectTo(`/booking/success?ref=${encodeURIComponent(txnid)}`);
    }

    if (status === 'success') {
      await markPaid(booking.id, paymentId, 'payu-verified');
      await audit('booking.paid', {
        booking_id: booking.id,
        reference: txnid,
        payment_id: paymentId,
        provider: 'payu',
      });

      void (async () => {
        try {
          const s = await getSettings();
          const us = buildUsRecipients(setting(s, 'internal_whatsapp_numbers', ''));
          await notifyGallabox({
            project,
            event: {
              event: 'booking.paid',
              title: 'Payment successful',
              data: {
                reference: txnid,
                tower_unit: booking.tower_unit,
                amount: booking.amount,
                payment_id: paymentId,
                provider: 'payu',
                customer_name: booking.full_name,
                customer_phone: booking.mobile,
              },
            },
            recipients: [
              { role: 'customer', phone: booking.mobile, name: booking.full_name },
              { role: 'developer', phone: project.developer_whatsapp, name: project.developer },
              ...us,
            ],
          });
        } catch (err: any) {
          console.error('[gallabox] payu booking.paid notify failed:', err?.message || err);
        }
      })();
    } else {
      await markFailed(booking.id, body.error_Message || body.error || 'PayU reported non-success');
      await audit('booking.failed', {
        booking_id: booking.id,
        reference: txnid,
        provider: 'payu',
        status,
      });

      void (async () => {
        try {
          const s = await getSettings();
          const us = buildUsRecipients(setting(s, 'internal_whatsapp_numbers', ''));
          await notifyGallabox({
            project,
            event: {
              event: 'booking.failed',
              title: 'Payment failed',
              data: {
                reference: txnid,
                tower_unit: booking.tower_unit,
                amount: booking.amount,
                reason: body.error_Message || body.error || status,
                provider: 'payu',
                customer_name: booking.full_name,
                customer_phone: booking.mobile,
              },
            },
            recipients: [
              { role: 'customer', phone: booking.mobile, name: booking.full_name },
              ...us,
            ],
          });
        } catch (err: any) {
          console.error('[gallabox] payu booking.failed notify failed:', err?.message || err);
        }
      })();
    }

    return redirectTo(`/booking/success?ref=${encodeURIComponent(txnid)}`);
  } catch (err: any) {
    await audit('booking.payu_callback_error', { message: err?.message || String(err) });
    return redirectTo('/');
  }
}

// PayU sometimes makes a follow-up GET to the same URL when the user clicks a
// link from a confirmation email. Redirect to home in that case.
export async function GET() {
  return redirectTo('/');
}

function redirectTo(path: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://booking.flowrealty.in';
  return NextResponse.redirect(new URL(path, siteUrl), { status: 303 });
}
