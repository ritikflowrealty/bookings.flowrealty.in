/**
 * Brevo (formerly Sendinblue) transactional email helper.
 *
 * Configure via environment variables:
 *   BREVO_API_KEY=xkeysib-...
 *   EMAIL_FROM_NAME=Flow Realty
 *   EMAIL_FROM_ADDRESS=hello@flowrealty.in
 *
 * The API key MUST be set in Vercel env vars only — never in code.
 */

const BREVO_API = 'https://api.brevo.com/v3';

export type EmailRecipient = { email: string; name?: string };

export type SendEmailArgs = {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  replyTo?: EmailRecipient;
  tags?: string[];
};

export async function sendEmail(args: SendEmailArgs): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY not set; skipping send');
    return { ok: false, error: 'BREVO_API_KEY not configured' };
  }

  const fromName = process.env.EMAIL_FROM_NAME || 'Flow Realty';
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'hello@flowrealty.in';

  const recipients = Array.isArray(args.to) ? args.to : [args.to];

  const payload: Record<string, unknown> = {
    sender: { name: fromName, email: fromEmail },
    to: recipients,
    subject: args.subject,
    htmlContent: args.html,
  };
  if (args.replyTo) payload.replyTo = args.replyTo;
  if (args.tags?.length) payload.tags = args.tags;

  try {
    const resp = await fetch(`${BREVO_API}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      return { ok: false, error: (errBody as any)?.message || `HTTP ${resp.status}` };
    }
    const data = await resp.json();
    return { ok: true, messageId: data.messageId };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Wraps message body in a branded HTML template matching the site's dark/neon theme.
 */
export function brandedTemplate(opts: {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const { preheader = '', heading, bodyHtml, ctaLabel, ctaUrl } = opts;
  const cta =
    ctaLabel && ctaUrl
      ? `<tr><td style="padding:32px 0 0 0;">
          <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#7B2EFF 0%,#D92EFF 35%,#FF3C82 65%,#FF6A00 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-family:Arial,sans-serif;">${ctaLabel}</a>
        </td></tr>`
      : '';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#0B0B0F;font-family:Arial,Helvetica,sans-serif;color:#F5F5F5;">
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0F;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#16161B;border-radius:24px;border:1px solid rgba(255,255,255,0.08);">
          <tr>
            <td style="padding:32px 32px 16px 32px;">
              <span style="background:linear-gradient(135deg,#7B2EFF 0%,#D92EFF 35%,#FF3C82 65%,#FF6A00 100%);-webkit-background-clip:text;background-clip:text;color:transparent;font-size:18px;font-weight:700;letter-spacing:-0.02em;">flow realty</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 0 32px;">
              <h1 style="margin:0;font-size:28px;font-weight:600;letter-spacing:-0.02em;color:#F5F5F5;">${heading}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 32px 32px;color:#9CA0A8;font-size:15px;line-height:1.6;">
              ${bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.08);color:#6B6F78;font-size:12px;">
              Flow Realty · Richards Town, Bangalore<br>
              <a href="https://booking.flowrealty.in" style="color:#9CA0A8;text-decoration:none;">booking.flowrealty.in</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
