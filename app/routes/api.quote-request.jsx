/**
 * POST /api/quote-request
 *
 * Receives a custom-printing quote submission from /pages/custom-printing
 * and:
 *   1. Generates a human-readable reference ID
 *   2. Logs the full request to the server console
 *      (later: forward to an email service like Resend / SendGrid / Mailgun)
 *   3. Returns the reference ID + summary for the success state
 *
 * Why no cart interaction? Custom-print quotes are a separate sales flow
 * from the standard catalog. Prices vary by job, art complexity, and
 * production timeline — none of which Shopify's cart expresses. The
 * customer pays via a manually-issued invoice or Stripe payment link
 * after we reply with the quote.
 *
 * To wire up real email later:
 *   - Sign up for a transactional email service (Resend free: 3k/mo)
 *   - Add the API key to .env as PRIVATE_RESEND_API_KEY
 *   - Uncomment and complete the sendQuoteEmail() function below
 */

export async function action({request, context}) {
  if (request.method !== 'POST') {
    return Response.json({ok: false, error: 'POST only'}, {status: 405});
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (e) {
    return Response.json(
      {ok: false, error: 'Could not parse form: ' + e?.message},
      {status: 400},
    );
  }

  // Pull fields out of the multipart body
  const submission = {
    // Selections
    product: formData.get('product')?.toString() || '',
    quantity: formData.get('quantity')?.toString() || '',
    color: formData.get('color')?.toString() || '',
    placement: formData.get('placement')?.toString() || '',
    scale: formData.get('scale')?.toString() || '',
    // Optional design info
    hasDesign: formData.get('hasDesign') === 'true',
    designFileName: formData.get('designFileName')?.toString() || null,
    // Notes
    notes: formData.get('notes')?.toString() || '',
    // Contact
    name: formData.get('name')?.toString() || '',
    company: formData.get('company')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    phone: formData.get('phone')?.toString() || '',
    neededBy: formData.get('neededBy')?.toString() || '',
  };

  // Basic validation — name + email + product + quantity
  const missing = [];
  if (!submission.name) missing.push('name');
  if (!submission.email) missing.push('email');
  if (!submission.product) missing.push('product');
  if (!submission.quantity) missing.push('quantity');
  if (missing.length > 0) {
    return Response.json(
      {ok: false, error: `Missing required fields: ${missing.join(', ')}`},
      {status: 400},
    );
  }

  // Email format check (lightweight — real validation is on the receiver side)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    return Response.json(
      {ok: false, error: 'Email format looks off'},
      {status: 400},
    );
  }

  // Generate a reference ID — YYYY-MMDD-XXXX format
  const referenceId = generateReferenceId();

  // Log to console so it shows up in dev terminal + production logs.
  // Later, replace this with sendQuoteEmail() below.
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📨 NEW QUOTE REQUEST · ${referenceId}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Customer:  ${submission.name} <${submission.email}>`);
  if (submission.company) console.log(`Company:   ${submission.company}`);
  if (submission.phone) console.log(`Phone:     ${submission.phone}`);
  console.log(
    `Product:   ${submission.product} · ${submission.quantity} units`,
  );
  console.log(
    `Style:     ${submission.color} · placement: ${submission.placement} · scale: ${submission.scale}%`,
  );
  console.log(
    `Design:    ${submission.hasDesign ? `Yes — ${submission.designFileName}` : 'No (to be discussed)'}`,
  );
  if (submission.neededBy) console.log(`Need by:   ${submission.neededBy}`);
  if (submission.notes) console.log(`Notes:     ${submission.notes}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Forward to email (uncomment + configure when ready)
  try {
    await sendQuoteEmail({submission, referenceId, env: context?.env});
  } catch (e) {
    console.error('Email send failed (request still saved):', e?.message);
    // Don't fail the request — the log + Shopify draft are the source of truth.
  }

  return Response.json({
    ok: true,
    referenceId,
    summary: {
      product: submission.product,
      quantity: submission.quantity,
    },
  });
}

// Block GET requests — this endpoint is action-only
export function loader() {
  return new Response('Method Not Allowed', {status: 405});
}

/* ============================================================ */
/* Helpers                                                       */
/* ============================================================ */

function generateReferenceId() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mmdd =
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${yyyy}-${mmdd}-${rand}`;
}

/**
 * Send the quote to your team's inbox via a transactional email service.
 *
 * Currently a stub. To enable:
 *   1. Sign up for https://resend.com (free 3k emails/mo)
 *   2. Add PRIVATE_RESEND_API_KEY to .env
 *   3. Restart dev server
 *   4. Submit a quote — the email lands at QUOTE_RECIPIENT
 *
 * Until then this no-ops silently. The quote is still saved in the server
 * console log for manual processing.
 */
async function sendQuoteEmail({submission, referenceId, env}) {
  const RESEND_KEY = env?.PRIVATE_RESEND_API_KEY;
  if (!RESEND_KEY) return; // not configured yet — silent no-op

  const QUOTE_RECIPIENT = 'info@sellanything.us';
  const FROM = 'quotes@sellanything.us'; // verify this domain in Resend first
  const subject = `New quote request · ${referenceId} · ${submission.product}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 4px;">Quote request</h2>
      <p style="color: #666; margin: 0 0 24px;">Reference: <code>${referenceId}</code></p>

      <h3 style="border-top: 1px solid #eee; padding-top: 16px;">Customer</h3>
      <p><strong>${escape(submission.name)}</strong>${
    submission.company ? ` · ${escape(submission.company)}` : ''
  }<br>
      ${escape(submission.email)}${submission.phone ? ` · ${escape(submission.phone)}` : ''}</p>

      <h3 style="border-top: 1px solid #eee; padding-top: 16px;">What they want</h3>
      <ul>
        <li><strong>Product:</strong> ${escape(submission.product)}</li>
        <li><strong>Quantity:</strong> ${escape(submission.quantity)} units</li>
        <li><strong>Color:</strong> ${escape(submission.color)}</li>
        <li><strong>Design placement:</strong> ${escape(submission.placement)} · ${escape(submission.scale)}%</li>
        <li><strong>Design file:</strong> ${
          submission.hasDesign
            ? escape(submission.designFileName || 'Attached')
            : 'Not provided yet'
        }</li>
        ${submission.neededBy ? `<li><strong>Need by:</strong> ${escape(submission.neededBy)}</li>` : ''}
      </ul>

      ${
        submission.notes
          ? `<h3 style="border-top: 1px solid #eee; padding-top: 16px;">Notes</h3>
             <p style="white-space: pre-wrap;">${escape(submission.notes)}</p>`
          : ''
      }

      <p style="border-top: 1px solid #eee; padding-top: 16px; color: #666; font-size: 12px;">
        Reply to <a href="mailto:${escape(submission.email)}">${escape(submission.email)}</a> to send the quote.
      </p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [QUOTE_RECIPIENT],
      reply_to: submission.email,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body.slice(0, 200)}`);
  }
}

function escape(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
