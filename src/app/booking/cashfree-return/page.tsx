import { redirect } from 'next/navigation';
import { getBookingByReference } from '@/lib/bookings';
import { getProjectById } from '@/lib/projects';
import { verifyCashfreePayment } from '@/lib/cashfree';
import { markPaid, markFailed } from '@/lib/bookings';
import { audit } from '@/lib/audit';

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
  } else {
    await markFailed(booking.id, 'Cashfree payment not completed');
    await audit('booking.failed', { booking_id: booking.id, reference: ref, provider: 'cashfree' });
  }

  redirect(`/booking/success?ref=${encodeURIComponent(ref)}`);
}
