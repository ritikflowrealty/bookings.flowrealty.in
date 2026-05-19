/**
 * Cashfree payment gateway helpers.
 * Uses the Cashfree PG API v2022-09-01 to create orders and verify payments.
 */

const SANDBOX_URL = 'https://sandbox.cashfree.com/pg';
const PROD_URL = 'https://api.cashfree.com/pg';

export type CashfreeCreateOrderArgs = {
  appId: string;
  secretKey: string;
  mode: string; // 'test' | 'production'
  orderId: string;
  amountInRupees: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notes: Record<string, string>;
};

export async function createCashfreeOrder(args: CashfreeCreateOrderArgs) {
  const baseUrl = args.mode === 'production' ? PROD_URL : SANDBOX_URL;

  const body = {
    order_id: args.orderId,
    order_amount: args.amountInRupees,
    order_currency: 'INR',
    customer_details: {
      customer_id: args.orderId,
      customer_name: args.customerName,
      customer_email: args.customerEmail,
      customer_phone: args.customerPhone,
    },
    order_meta: {
      return_url: args.returnUrl,
      notify_url: '',
    },
    order_note: Object.entries(args.notes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ')
      .slice(0, 500),
    order_tags: args.notes,
  };

  const resp = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': args.appId,
      'x-client-secret': args.secretKey,
      'x-api-version': '2023-08-01',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(
      (err as any)?.message || `Cashfree order creation failed with status ${resp.status}`
    );
  }

  const data = await resp.json();
  return {
    orderId: data.order_id as string,
    paymentSessionId: data.payment_session_id as string,
    orderStatus: data.order_status as string,
  };
}

export async function verifyCashfreePayment(args: {
  appId: string;
  secretKey: string;
  mode: string;
  orderId: string;
}): Promise<{ paid: boolean; paymentId: string }> {
  const baseUrl = args.mode === 'production' ? PROD_URL : SANDBOX_URL;

  const resp = await fetch(`${baseUrl}/orders/${args.orderId}`, {
    headers: {
      'x-client-id': args.appId,
      'x-client-secret': args.secretKey,
      'x-api-version': '2023-08-01',
    },
  });

  if (!resp.ok) {
    return { paid: false, paymentId: '' };
  }

  const data = await resp.json();
  const paid = data.order_status === 'PAID';
  // Get payment ID from payments endpoint
  let paymentId = '';
  if (paid) {
    try {
      const pResp = await fetch(`${baseUrl}/orders/${args.orderId}/payments`, {
        headers: {
          'x-client-id': args.appId,
          'x-client-secret': args.secretKey,
          'x-api-version': '2023-08-01',
        },
      });
      if (pResp.ok) {
        const payments = await pResp.json();
        if (Array.isArray(payments) && payments.length > 0) {
          paymentId = payments[0].cf_payment_id || payments[0].payment_id || '';
        }
      }
    } catch {
      // non-critical
    }
  }
  return { paid, paymentId: String(paymentId) };
}
