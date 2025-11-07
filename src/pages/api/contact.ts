import type { APIRoute } from 'astro';
import Brevo from '@getbrevo/brevo';

// Simple in-memory rate limiting
const submissionTracker = new Map<string, number[]>();
const MAX_SUBMISSIONS_PER_HOUR = 5;
const ONE_HOUR_MS = 60 * 60 * 1000;

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const submissions = submissionTracker.get(email) || [];

  // Remove submissions older than 1 hour
  const recentSubmissions = submissions.filter(time => now - time < ONE_HOUR_MS);

  if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
    return false;
  }

  // Add current submission
  recentSubmissions.push(now);
  submissionTracker.set(email, recentSubmissions);

  return true;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const POST: APIRoute = async ({ request }) => {
  // Validate content type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Extract and validate required fields
  const { name, email, message, agreeToPolicy, company, phoneNumber, timestamp } = body;

  if (!name || !email || !message || agreeToPolicy !== true) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check rate limit
  if (!checkRateLimit(email)) {
    console.warn(`Rate limit exceeded for email: ${email}`);
    return new Response(JSON.stringify({ error: 'Too many submissions. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check environment variables
  const brevoApiKey = import.meta.env.BREVO_API_KEY;
  const recipientEmail = import.meta.env.CONTACT_FORM_RECIPIENT;
  const fromEmail = import.meta.env.FROM_EMAIL || 'noreply@quick3-for-woocommerce.no';

  if (!brevoApiKey || !recipientEmail) {
    console.error('Missing required environment variables: BREVO_API_KEY or CONTACT_FORM_RECIPIENT');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Initialize Brevo
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    brevoApiKey
  );

  // Format timestamp
  const submissionTime = timestamp
    ? new Date(timestamp).toLocaleString('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  // Build email HTML
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 6px 6px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 6px 6px; }
        .field { margin: 15px 0; padding: 12px; background: white; border-radius: 4px; }
        .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { margin-top: 4px; color: #1f2937; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Ny kontaktforespørsel</h2>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Navn</div>
            <div class="value">${escapeHtml(name)}</div>
          </div>
          ${company ? `
          <div class="field">
            <div class="label">Selskap</div>
            <div class="value">${escapeHtml(company)}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">E-post</div>
            <div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
          </div>
          ${phoneNumber ? `
          <div class="field">
            <div class="label">Telefon</div>
            <div class="value">${escapeHtml(phoneNumber)}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">Melding</div>
            <div class="value">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
          </div>
          <div class="footer">
            <p>Mottatt: ${submissionTime}</p>
            <p>Quick3 for WooCommerce</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email via Brevo
  try {
    await apiInstance.sendTransacEmail({
      sender: {
        email: fromEmail,
        name: 'Quick3 for WooCommerce'
      },
      to: [{ email: recipientEmail }],
      replyTo: { email: email, name: name },
      subject: `Ny kontaktforespørsel fra ${escapeHtml(name)}`,
      htmlContent: emailHtml
    });

    console.log(`Contact form submission sent to ${recipientEmail} from ${email} at ${submissionTime}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to send contact form email via Brevo:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
