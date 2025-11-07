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
