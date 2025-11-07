# Brevo Contact Form Integration Design

**Date:** 2025-11-07
**Status:** Approved
**Author:** Design session with Claude

## Background

The contact form currently submits to an n8n webhook that has stopped working due to n8n instance failure. We need to replace it with a direct Brevo integration to send email notifications when users submit the contact form.

## Requirements

- Send email notification to single recipient when contact form is submitted
- Maintain existing form UX and GTM conversion tracking
- Use Brevo API (already available in sibling project)
- Run in Astro with Node.js server mode
- Deploy to Node.js server (self-hosted)

## Architecture Overview

### Components

1. **API Endpoint:** `src/pages/api/contact.ts` - handles POST requests from contact form
2. **Astro Adapter:** `@astrojs/node` - enables server-side rendering and API endpoints
3. **Brevo Integration:** `@getbrevo/brevo` package for sending transactional emails
4. **Configuration:** Environment variables for API key, sender email, and notification recipient

### Request Flow

1. User fills out contact form and clicks submit
2. Frontend JavaScript posts form data to `/api/contact`
3. API endpoint validates request
4. Brevo sends notification email to configured recipient
5. API returns success/error response
6. Frontend shows success message and triggers GTM tracking (or shows error)

### Key Design Decisions

- **Simple inline approach:** All Brevo logic in API endpoint (no service layer) for simplicity
- **Server mode:** Full server mode (not hybrid) as specified
- **Shared API key:** Same Brevo API key can be reused from other app
- **Maintains existing UX:** Keep all current form behavior and GTM tracking

## Data Flow & Validation

### API Endpoint

```
POST /api/contact

Request body:
{
  name: string (required),
  company: string (optional),
  email: string (required, validated),
  phoneNumber: string (optional),
  message: string (required),
  agreeToPolicy: boolean (required, must be true),
  timestamp: string (ISO format)
}
```

### Validation Rules

- **Required fields:** name, email, message, agreeToPolicy
- **Email format:** Standard email validation
- **Rate limiting:** Simple in-memory rate limiting to prevent spam (max 5 submissions per email per hour)
- **CORS:** Allow requests from own domain only

### Email Notification

Email sent to configured recipient contains:
- **Subject:** "New Contact Form Submission from [name]"
- **Body:** All form fields formatted in HTML
- **Timestamp:** Norwegian format
- **Reply-to:** Set to submitter's email for easy replies

### Error Handling

- Missing required fields → 400 Bad Request
- Invalid email format → 400 Bad Request
- Brevo API failure → 500 Internal Server Error (log full error)
- Return user-friendly error messages (don't expose internals)

## Configuration

### Environment Variables

```
BREVO_API_KEY=your_brevo_api_key_here
CONTACT_FORM_RECIPIENT=support@iniva.no
FROM_EMAIL=noreply@quick3-for-woocommerce.no
```

### Astro Configuration

```javascript
// astro.config.mjs
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',  // Enable server mode
  adapter: node({ mode: 'standalone' }),
  // ... rest of config
});
```

### Package Dependencies

Add to package.json:
- `@astrojs/node` - Astro adapter for Node.js
- `@getbrevo/brevo` (^3.0.1) - Brevo SDK

### Frontend Changes

Update `src/components/ContactForm.astro`:
- Change webhook URL to `/api/contact`
- Remove n8n webhook environment variable logic
- Keep all existing GTM tracking
- Keep all existing UI/UX and error messages
- Update to handle new API response format

## Security

### Security Measures

- **API Key Protection:** Brevo API key in environment variables only (never in git)
- **Input Sanitization:** Validate and sanitize all form inputs before sending
- **CORS Policy:** API endpoint only accepts requests from own domain
- **Rate Limiting:** In-memory tracking to prevent spam abuse
- **Error Messages:** User-friendly messages that don't expose internals

### Logging

- Log successful submissions (email address, timestamp)
- Log validation errors (don't log personal data)
- Log Brevo API errors with full details for debugging

### Graceful Degradation

- If Brevo API down: log submission locally and return error to user
- User can retry submission
- Manual processing of logged submissions if needed

## Production Checklist

- [ ] Set environment variables on production server
- [ ] Test email delivery with real Brevo account
- [ ] Verify GTM tracking fires correctly
- [ ] Test error scenarios (missing fields, invalid email, API down)
- [ ] Monitor logs after deployment

## Deployment

- Environment variables must be set on Node.js server
- No special build changes needed (Astro bundles API endpoint)
- API endpoint available at: `https://quick3-for-woocommerce.no/api/contact`

## Success Criteria

- Contact form submissions send email notifications successfully
- All GTM conversion tracking continues to work
- Form UX remains unchanged from user perspective
- Error handling provides clear feedback to users
- No spam submissions due to rate limiting
