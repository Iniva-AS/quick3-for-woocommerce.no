# Brevo Contact Form Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace n8n webhook with direct Brevo integration for contact form email notifications

**Architecture:** Simple inline API endpoint approach using Astro server mode with Node.js adapter, Brevo SDK for transactional emails, all logic contained in single API route file

**Tech Stack:** Astro (server mode), @astrojs/node adapter, @getbrevo/brevo SDK, TypeScript

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install @astrojs/node adapter**

Run:
```bash
npm install @astrojs/node
```

Expected: Package installed successfully

**Step 2: Install Brevo SDK**

Run:
```bash
npm install @getbrevo/brevo@^3.0.1
```

Expected: Package installed successfully, same version as sibling project

**Step 3: Commit dependency changes**

Run:
```bash
git add package.json package-lock.json
git commit -m "feat: add Astro node adapter and Brevo SDK"
```

---

## Task 2: Configure Astro for Server Mode

**Files:**
- Modify: `astro.config.mjs`

**Step 1: Import node adapter**

At the top of `astro.config.mjs`, add after line 5:

```javascript
import node from '@astrojs/node';
```

**Step 2: Add server mode configuration**

In the `defineConfig` object (after line 8), add:

```javascript
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: 'https://quick3-for-woocommerce.no',
  // ... rest of existing config
});
```

Complete modified file should look like:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: 'https://quick3-for-woocommerce.no',
  i18n: {
    defaultLocale: 'no',
    locales: ['no', 'en'],
    routing: {
      prefixDefaultLocale: true
    }
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['host.docker.internal']
    }
  }
});
```

**Step 3: Verify configuration builds**

Run:
```bash
npm run build
```

Expected: Build completes successfully with server output

**Step 4: Commit configuration**

Run:
```bash
git add astro.config.mjs
git commit -m "feat: enable Astro server mode with Node adapter"
```

---

## Task 3: Create API Endpoint Directory Structure

**Files:**
- Create: `src/pages/api/` (directory)

**Step 1: Create api directory**

Run:
```bash
mkdir -p src/pages/api
```

Expected: Directory created successfully

**Step 2: Verify directory exists**

Run:
```bash
ls -la src/pages/api
```

Expected: Directory listed

---

## Task 4: Create Contact API Endpoint

**Files:**
- Create: `src/pages/api/contact.ts`

**Step 1: Create the API endpoint file**

Create `src/pages/api/contact.ts` with complete implementation:

```typescript
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
            <div class="value">${name}</div>
          </div>
          ${company ? `
          <div class="field">
            <div class="label">Selskap</div>
            <div class="value">${company}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">E-post</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          ${phoneNumber ? `
          <div class="field">
            <div class="label">Telefon</div>
            <div class="value">${phoneNumber}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">Melding</div>
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
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
      subject: `Ny kontaktforespørsel fra ${name}`,
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
```

**Step 2: Verify TypeScript compiles**

Run:
```bash
npm run build
```

Expected: Build completes successfully, no TypeScript errors

**Step 3: Commit API endpoint**

Run:
```bash
git add src/pages/api/contact.ts
git commit -m "feat: add Brevo contact form API endpoint"
```

---

## Task 5: Update Contact Form Component

**Files:**
- Modify: `src/components/ContactForm.astro`

**Step 1: Update form data attribute**

On line 29, change:
```astro
<form id="contact-form" data-n8n-url={n8nWebhookUrl} class="mx-auto mt-16 max-w-xl sm:mt-20">
```

To:
```astro
<form id="contact-form" class="mx-auto mt-16 max-w-xl sm:mt-20">
```

**Step 2: Remove n8n environment variable**

Remove lines 11-12:
```astro
// You can set the n8n webhook URL via environment variable or pass it as a prop
const n8nWebhookUrl = import.meta.env.PUBLIC_N8N_WEBHOOK_URL || '';
```

**Step 3: Update JavaScript to use new API endpoint**

Replace the entire `<script>` section (lines 139-228) with:

```astro
<script>
  const form = document.getElementById('contact-form') as HTMLFormElement;
  const statusDiv = document.getElementById('form-status') as HTMLDivElement;
  const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement;

  // Get localized messages from data attributes or defaults
  const messages = {
    success: submitButton?.closest('form')?.querySelector('[data-success]')?.getAttribute('data-success') || 'Thank you! Your message has been sent successfully.',
    error: submitButton?.closest('form')?.querySelector('[data-error]')?.getAttribute('data-error') || 'Failed to send message. Please try again.',
    submitText: submitButton?.getAttribute('data-submit-text') || 'Send message',
    sendingText: submitButton?.getAttribute('data-sending-text') || 'Sending...',
  };

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phoneNumber: formData.get('phone-number'),
      message: formData.get('message'),
      agreeToPolicy: formData.get('agree-to-policies') === 'on',
      timestamp: new Date().toISOString(),
    };

    submitButton.disabled = true;
    submitButton.textContent = messages.sendingText;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // ═══════════════════════════════════════════════════════════════
        // CONVERSION TRACKING: Contact Form Success
        // ═══════════════════════════════════════════════════════════════
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          'event': 'contact_form_submit',
          'form_type': 'contact',
          'form_name': 'Contact Form',
          'form_success': true,
          'event_category': 'Contact',
          'event_action': 'Form Submit',
          'event_label': 'Contact Form Submission'
        });

        // Log to console for debugging (remove in production if desired)
        console.log('📩 Contact Form Submission Tracked:', {
          formType: 'contact',
          success: true,
          timestamp: new Date().toISOString()
        });

        statusDiv.textContent = messages.success;
        statusDiv.className = 'mt-4 text-center text-sm text-green-600';
        statusDiv.classList.remove('hidden');
        form.reset();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      statusDiv.textContent = messages.error;
      statusDiv.className = 'mt-4 text-center text-sm text-red-600';
      statusDiv.classList.remove('hidden');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = messages.submitText;
    }
  });
</script>
```

**Step 4: Verify build succeeds**

Run:
```bash
npm run build
```

Expected: Build completes successfully

**Step 5: Commit form updates**

Run:
```bash
git add src/components/ContactForm.astro
git commit -m "feat: update contact form to use Brevo API endpoint"
```

---

## Task 6: Create Environment Variables Template

**Files:**
- Create: `.env.example`

**Step 1: Create environment template file**

Create `.env.example` with:

```env
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key_here
CONTACT_FORM_RECIPIENT=support@iniva.no
FROM_EMAIL=noreply@quick3-for-woocommerce.no
```

**Step 2: Commit template**

Run:
```bash
git add .env.example
git commit -m "docs: add environment variables template"
```

---

## Task 7: Manual Testing Setup

**Files:**
- Create: `.env` (local only, not committed)

**Step 1: Copy environment template**

Run:
```bash
cp .env.example .env
```

Expected: .env file created

**Step 2: Add real Brevo API key**

Edit `.env` and add your actual Brevo API key from the sibling project or Brevo dashboard.

**Step 3: Verify .env is gitignored**

Run:
```bash
git status
```

Expected: .env should NOT appear in untracked files (should be in .gitignore)

**Step 4: Start development server**

Run:
```bash
npm run dev
```

Expected: Server starts successfully on localhost

**Step 5: Test form submission**

Manual steps:
1. Open browser to http://localhost:4321/no or http://localhost:4321/en
2. Scroll to contact form
3. Fill out all required fields (name, email, message, agree to policy)
4. Click submit
5. Verify success message appears
6. Check configured recipient email for notification

Expected: Email received successfully with all form data

**Step 6: Test rate limiting**

Manual steps:
1. Submit form 5 times with same email quickly
2. On 6th submission, should see rate limit error
3. Wait 1 hour or restart server to reset

Expected: Rate limiting works correctly

**Step 7: Test validation errors**

Test scenarios:
- Submit without required fields → Should see 400 error
- Submit with invalid email format → Should see 400 error
- Submit without agreeing to policy → Should see 400 error

Expected: All validation works correctly

---

## Task 8: Update Documentation

**Files:**
- Create: `README-deployment.md`

**Step 1: Create deployment documentation**

Create `README-deployment.md`:

```markdown
# Deployment Guide

## Environment Variables

Set these environment variables on your production Node.js server:

```bash
BREVO_API_KEY=your_production_brevo_api_key
CONTACT_FORM_RECIPIENT=support@iniva.no
FROM_EMAIL=noreply@quick3-for-woocommerce.no
```

## Build and Deploy

1. Build the project:
```bash
npm run build
```

2. The build output will be in `dist/`

3. Start the server:
```bash
node dist/server/entry.mjs
```

Or use a process manager like PM2:
```bash
pm2 start dist/server/entry.mjs --name quick3-website
```

## Verification

After deployment:
1. Test contact form submission
2. Verify email is received
3. Check server logs for any errors
4. Verify GTM tracking fires

## Troubleshooting

- **No email received:** Check BREVO_API_KEY is set correctly
- **500 errors:** Check server logs for Brevo API errors
- **Form doesn't submit:** Check browser console for CORS/network errors
```

**Step 2: Commit documentation**

Run:
```bash
git add README-deployment.md
git commit -m "docs: add deployment guide for Brevo integration"
```

---

## Task 9: Final Verification

**Step 1: Clean build test**

Run:
```bash
rm -rf dist node_modules/.astro
npm run build
```

Expected: Clean build succeeds

**Step 2: Production mode test**

Run:
```bash
npm run build
node dist/server/entry.mjs
```

Expected: Server starts and form works in production mode

**Step 3: Verify all commits**

Run:
```bash
git log --oneline -10
```

Expected: See all commits for this implementation

**Step 4: Create final summary commit**

Run:
```bash
git add .
git commit -m "feat: complete Brevo contact form integration

- Added Node.js adapter for server mode
- Created API endpoint at /api/contact
- Integrated Brevo SDK for email notifications
- Updated contact form to use new endpoint
- Added rate limiting and validation
- Maintained GTM tracking
- Added deployment documentation"
```

---

## Success Criteria

- [ ] Contact form submits successfully
- [ ] Email notifications received at configured recipient
- [ ] GTM conversion tracking still fires
- [ ] Rate limiting prevents spam
- [ ] Validation catches invalid inputs
- [ ] Error messages are user-friendly
- [ ] Build succeeds without errors
- [ ] Documentation complete

## Environment Variables Required

```
BREVO_API_KEY=<from Brevo dashboard>
CONTACT_FORM_RECIPIENT=<your email>
FROM_EMAIL=noreply@quick3-for-woocommerce.no
```
