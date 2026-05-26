/**
 * PayU payment gateway helpers.
 *
 * PayU uses a form-post redirect flow:
 *   1. Server generates a SHA-512 request hash from booking data.
 *   2. Browser auto-submits a hidden form POST to PayU's payment URL.
 *   3. User pays on PayU's hosted page.
 *   4. PayU POSTs to our `surl` (success) or `furl` (failure) with a response
 *      hash that we verify server-side before marking the booking paid.
 *
 * Each project stores its own merchant key + salt, so this module always
 * takes credentials as arguments rather than reading globals.
 */
import crypto from 'node:crypto';

export const PAYU_TEST_URL = 'https://test.payu.in/_payment';
export const PAYU_PROD_URL = 'https://secure.payu.in/_payment';

export type PayuMode = 'test' | 'production';

export function payuPaymentUrl(mode: PayuMode | string): string {
  return mode === 'production' ? PAYU_PROD_URL : PAYU_TEST_URL;
}

export type PayuRequestParams = {
  key: string;
  txnid: string;
  amount: string; // formatted as plain number string, e.g. "1500.00"
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
};

/**
 * Generate the SHA-512 request hash exactly per PayU's documented sequence:
 *   key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
 */
export function generatePayuRequestHash(params: PayuRequestParams, salt: string): string {
  const udf1 = params.udf1 || '';
  const udf2 = params.udf2 || '';
  const udf3 = params.udf3 || '';
  const udf4 = params.udf4 || '';
  const udf5 = params.udf5 || '';

  const hashString =
    `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}` +
    `|${params.firstname}|${params.email}` +
    `|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}` +
    `||||||${salt}`;

  return crypto.createHash('sha512').update(hashString, 'utf8').digest('hex').toLowerCase();
}

/**
 * Verify the response hash sent by PayU on the success/failure callback.
 *
 * PayU response hash sequence (reverse order from request, plus status):
 *   salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 */
export function verifyPayuResponseHash(
  body: Record<string, string>,
  salt: string
): boolean {
  const expectedHash = body.hash;
  if (!expectedHash) return false;

  const status = body.status || '';
  const key = body.key || '';
  const txnid = body.txnid || '';
  const amount = body.amount || '';
  const productinfo = body.productinfo || '';
  const firstname = body.firstname || '';
  const email = body.email || '';
  const udf1 = body.udf1 || '';
  const udf2 = body.udf2 || '';
  const udf3 = body.udf3 || '';
  const udf4 = body.udf4 || '';
  const udf5 = body.udf5 || '';

  // Optional "additionalCharges" prefix when PayU adds surcharges. We support
  // both with and without it (most merchants don't have it configured).
  const additionalCharges = body.additionalCharges || '';

  const baseString =
    `${salt}|${status}|||||||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}` +
    `|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

  const stringWithCharges = additionalCharges
    ? `${additionalCharges}|${baseString}`
    : baseString;

  const candidate1 = crypto.createHash('sha512').update(baseString, 'utf8').digest('hex').toLowerCase();
  const candidate2 = additionalCharges
    ? crypto.createHash('sha512').update(stringWithCharges, 'utf8').digest('hex').toLowerCase()
    : '';

  const expected = expectedHash.toLowerCase();
  return safeEq(expected, candidate1) || (!!candidate2 && safeEq(expected, candidate2));
}

function safeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  try {
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export type PayuOrderArgs = {
  merchantKey: string;
  salt: string;
  mode: PayuMode | string;
  txnid: string;
  amountInRupees: number;
  productInfo: string;
  firstName: string;
  email: string;
  phone: string;
  // Optional extended details — passed straight through to PayU.
  lastName?: string;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  surl: string; // success return URL
  furl: string; // failure return URL
  notes?: Record<string, string>; // mapped into udf1-5 if present
};

export type PayuFormPayload = {
  url: string;
  fields: Record<string, string>;
};

/**
 * Build the form-post payload (URL + fields including request hash).
 * The browser submits a hidden form to `url` with `fields` as POST body.
 */
export function buildPayuFormPayload(args: PayuOrderArgs): PayuFormPayload {
  const amountStr = Number(args.amountInRupees).toFixed(2);

  // Map up to 5 note keys into udf1-5 (PayU supports max 5 UDF fields).
  const noteEntries = Object.entries(args.notes || {}).slice(0, 5);
  const udf: Record<string, string> = {};
  noteEntries.forEach(([k, v], i) => {
    udf[`udf${i + 1}`] = `${k}:${v}`.slice(0, 255);
  });

  const hashParams: PayuRequestParams = {
    key: args.merchantKey,
    txnid: args.txnid,
    amount: amountStr,
    productinfo: args.productInfo,
    firstname: args.firstName,
    email: args.email,
    udf1: udf.udf1 || '',
    udf2: udf.udf2 || '',
    udf3: udf.udf3 || '',
    udf4: udf.udf4 || '',
    udf5: udf.udf5 || '',
  };

  const hash = generatePayuRequestHash(hashParams, args.salt);

  const fields: Record<string, string> = {
    key: args.merchantKey,
    txnid: args.txnid,
    amount: amountStr,
    productinfo: args.productInfo,
    firstname: args.firstName,
    email: args.email,
    phone: args.phone,
    surl: args.surl,
    furl: args.furl,
    hash,
    service_provider: 'payu_paisa', // standard for non-Bolt integrations
    udf1: hashParams.udf1 || '',
    udf2: hashParams.udf2 || '',
    udf3: hashParams.udf3 || '',
    udf4: hashParams.udf4 || '',
    udf5: hashParams.udf5 || '',
  };

  if (args.lastName) fields.lastname = args.lastName;
  if (args.address1) fields.address1 = args.address1;
  if (args.city) fields.city = args.city;
  if (args.state) fields.state = args.state;
  if (args.country) fields.country = args.country;
  if (args.zipcode) fields.zipcode = args.zipcode;

  return { url: payuPaymentUrl(args.mode), fields };
}
