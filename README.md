# BugBrief

BugBrief turns a messy client message, Slack fragment, QA note, or stack trace into a concise, reproducible engineering issue.

## Why

Developer discussions repeatedly point to the same failure mode: incoming bug reports lack the context needed to reproduce them. A 2026 SaaS discussion reported that properly writing one can take 8–12 minutes and involves repeated context switching.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- OpenAI API
- Stripe subscriptions
- Vercel

## Local setup

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/bugbrief.git
cd bugbrief
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

See `.env.example`. Required values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `ADMIN_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_UPI_ID`
- `NEXT_PUBLIC_UPI_NAME`

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor.

Enable Email auth. For Google:
1. Supabase Dashboard → Authentication → Providers → Google.
2. Create a Google OAuth client in Google Cloud Console.
3. Add the Supabase callback URL shown in the provider configuration to Google's Authorized redirect URIs.
4. Add the Google client ID and secret in Supabase.
5. Add your deployed `https://YOUR_DOMAIN/auth/callback` to the Supabase URL configuration / redirect allow list.

## Stripe

1. Create a Stripe account.
2. Create a Product named `BugBrief Pro`.
3. Create a recurring monthly Price of `$12`.
4. Put the price ID in `STRIPE_PRO_PRICE_ID`.
5. Use test keys while developing.
6. Add a webhook endpoint:
   `https://YOUR_DOMAIN/api/stripe/webhook`
7. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
8. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

For local webhook testing, install Stripe CLI and run:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the displayed `whsec_...` value into `.env.local`.

## Vercel

Import the GitHub repository into Vercel. Add every variable from `.env.example` in Project Settings → Environment Variables, then deploy.

Set `NEXT_PUBLIC_SITE_URL` to the deployed URL and update Stripe's webhook endpoint to the production URL.

## Admin UPI activation

Direct UPI payments cannot safely self-confirm from a QR alone. The included endpoint is intentionally protected:

```bash
curl -X POST "https://YOUR_DOMAIN/api/admin/upgrade" \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -d '{"email":"customer@example.com"}'
```

For genuinely zero-touch Indian payments, replace the direct QR flow with Razorpay/another UPI-capable payment processor and activate Pro from its verified webhook.

## Production notes

The daily free quota is enforced against PostgreSQL, so it is authoritative across Vercel instances. Stripe webhooks use signature verification. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, or `ADMIN_SECRET` to the browser.
