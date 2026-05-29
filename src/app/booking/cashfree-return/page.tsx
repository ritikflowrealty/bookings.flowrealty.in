import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { getBookingByReference } from '@/lib/bookings';
import { getProjectById } from '@/lib/projects';
import { verifyCashfreePayment } from '@/lib/cashfree';
import { markPaid, markFailed } from '@/lib/bookings';
import { audit } from '@/lib/audit';
import { notifyGallabox, buildUsRecipients } from '@/lib/gallabox';
import { getSettings, setting } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function CashfreeReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  const ref = (sp?.ref || '').slice(0, 64);

  if (!ref) redirect('/');

  const booking = await getBookingByReference(ref);
  if (!booking) redirect('/');

  const project = await getProjectById(booking.project_id);
  if (!project || !project.cashfree_app_id || !project.cashfree_secret_key) {
    redirect(`/booking/success?ref=${encodeURIComponent(ref)}`);
  }

  // Verify payment with Cashfree
  const result = await verifyCashfreePayment({
    appId: project.cashfree_app_id,
    secretKey: project.cashfree_secret_key,
    mode: project.cashfree_mode || 'test',
    orderId: ref,
  });

  if (result.paid) {
    await markPaid(booking.id, result.paymentId, 'cashfree-verified');
    await audit('booking.paid', {
      booking_id: booking.id,
      reference: ref,
      payment_id: result.paymentId,
      provider: 'cashfree',
    });

    after(async () => {
      try {
        const s = await getSettings();
        const us = buildUsRecipients(setting(s, 'internal_whatsapp_numbers', ''));
        await notifyGallabox({
          project,
          event: {
            event: 'booking.paid',
            title: 'Payment successful',
            data: {
              reference: ref,
              tower_unit: booking.tower_unit,
              amount: booking.amount,
              payment_id: result.paymentId,
              provider: 'cashfree',
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
        console.error('[gallabox] cashfree booking.paid notify failed:', err?.message || err);
      }
    });
  } else {
    await markFailed(booking.id, 'Cashfree payment not completed');
    await audit('booking.failed', { booking_id: booking.id, reference: ref, provider: 'cashfree' });

    after(async () => {
      try {
        const s = await getSettings();
        const us = buildUsRecipients(setting(s, 'internal_whatsapp_numbers', ''));
        await notifyGallabox({
          project,
          event: {
            event: 'booking.failed',
            title: 'Payment failed',
            data: {
              reference: ref,
              tower_unit: booking.tower_unit,
              amount: booking.amount,
              reason: 'Cashfree payment not completed',
              provider: 'cashfree',
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
        console.error('[gallabox] cashfree booking.failed notify failed:', err?.message || err);
      }
    });
  }

  redirect(`/booking/success?ref=${encodeURIComponent(ref)}`);
}
