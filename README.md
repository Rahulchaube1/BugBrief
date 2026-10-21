# BugBrief

**Turn messy bug reports into developer-ready issues.**

BugBrief takes rough QA notes, client messages, stack traces, and incomplete bug descriptions and turns them into a structured issue that engineers can understand and investigate. Paste what you have; BugBrief extracts the useful details, identifies what is missing, and generates a concise report you can copy into your team's workflow.

[Explore the repository](https://github.com/Rahulchaube1/BugBrief) · [Report a bug](https://github.com/Rahulchaube1/BugBrief/issues)

---

## What BugBrief does

Bug reports often arrive as fragments: “checkout is broken on my phone,” a few console lines, or a message with no reproduction steps. BugBrief helps turn that raw context into a consistent engineering handoff.

**Input:** a plain-text description, QA notes, client message, error output, or other pasted context.

**Output:** a structured report containing:

- **Title and summary** — a clear description of the issue.
- **Severity** — an initial severity assessment based on the provided details.
- **Environment** — relevant platform or environment details when present.
- **Steps to reproduce** — an ordered sequence extracted from the report.
- **Expected and actual behavior** — what should happen versus what the report says happened.
- **Technical context and likely area** — clues that may help an engineer start investigating.
- **Reproduction confidence** — a low, medium, or high estimate based on the available information.
- **Markdown issue** — a copy-ready version for an issue tracker or engineering discussion.

BugBrief is an assistant for organizing bug reports, not a substitute for reproducing the issue or verifying an AI-generated diagnosis. It is instructed not to invent missing facts.

## Product highlights

- **Fast report generation:** generate structured output from one text input.
- **Secret masking:** common credential and secret patterns are masked before the prompt is sent to the model.
- **Copy-ready Markdown:** copy a complete issue from the dashboard.
- **Daily usage tracking:** the free allowance is tracked server-side using PostgreSQL-backed Supabase tables.
- **Account-based workspace:** sign up, sign in, and access the report workflow.
- **Pro plan support:** Stripe Checkout and webhook handling support subscription activation and cancellation.
- **Responsive web app:** built with the Next.js App Router and Tailwind CSS.

### Plans

| Plan | Included |
| --- | --- |
| **Free** | 5 generated reports per day, Markdown output, basic secret masking |
| **Pro** | Listed at **$12/month**; unlimited reports and additional workflow benefits described in the product UI |

Pricing and limits are product configuration, so check the live deployment before relying on them.

## How it works

1. **Paste context.** Add a rough report, stack trace, client note, or QA observation.
2. **Generate.** BugBrief validates the input, checks the account's daily usage and plan, masks common secrets, and sends the sanitized content to the configured OpenAI model.
3. **Review.** Inspect the title, summary, severity, reproduction steps, expected/actual behavior, environment, and technical context.
4. **Copy.** Copy the Markdown issue into your existing issue tracker or engineering workflow.

BugBrief currently generates a report from pasted text; it does not automatically open or update issues in GitHub, Jira, Linear, or ClickUp.

## Technology

| Layer | Technology |
| --- | --- |
| Web framework | Next.js 14 App Router |
| Language | TypeScript |
| UI | React 18, Tailwind CSS, Lucide |
| Authentication | Supabase Auth with `@supabase/ssr` |
| Database | Supabase PostgreSQL |
| Report generation | OpenAI API |
| Billing | Stripe Checkout and webhooks |
| Deployment configuration | Vercel |

## Run locally

### Prerequisites

- Node.js version specified in `.nvmrc`
- npm
- A Supabase project
- An OpenAI API key
- Stripe account and test keys if you want to test subscriptions

### 1. Clone and install

```bash
git clone https://github.com/Rahulchaube1/BugBrief.git
cd BugBrief
npm install
```

### 2. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in the values for your own services. Do not commit `.env.local` or real credentials.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Base URL for the app, such as `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key used by the browser and server auth client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for trusted database and auth operations |
| `OPENAI_API_KEY` | Server-side OpenAI API key |
| `OPENAI_MODEL` | Model name used for report generation; example: `gpt-4o-mini` |
| `STRIPE_SECRET_KEY` | Server-side Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook endpoint |
| `STRIPE_PRO_PRICE_ID` | Stripe recurring Price ID for BugBrief Pro |
| `ADMIN_SECRET` | Long, random secret protecting the manual admin upgrade endpoint |
| `NEXT_PUBLIC_UPI_ID` | UPI ID used by the product's payment flow, if enabled |
| `NEXT_PUBLIC_UPI_NAME` | Display name for the UPI payment flow |

The `.env.example` file documents the expected variable names. Never expose `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, or `ADMIN_SECRET` in client-side code or public repositories.

### 3. Set up Supabase

1. Create a project in Supabase.
2. Open the SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Providers**, enable Email authentication.
4. For Google sign-in, configure the Google OAuth client in Google Cloud and add the callback URL provided by Supabase.
5. In Supabase URL configuration, add your local and production callback URLs to the allowed redirect URLs as appropriate.

The schema defines profiles, subscription state, usage logs, and generated reports, along with row-level security policies. Server-side operations that use the service-role key bypass RLS, so protect that key carefully.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful project scripts:

```bash
npm run dev     # Start local development
npm run build   # Build for production
npm run start   # Start the production server
npm run lint    # Run the configured Next.js lint command
```

## Stripe subscription setup

Stripe is optional for developing the core report-generation workflow. To test the Pro subscription flow:

1. Create a Stripe product named `BugBrief Pro`.
2. Create a recurring monthly price and set its ID as `STRIPE_PRO_PRICE_ID`.
3. Use Stripe test-mode credentials during local development.
4. Configure a webhook endpoint at `https://YOUR_DOMAIN/api/stripe/webhook`.
5. Subscribe the webhook to `checkout.session.completed` and `customer.subscription.deleted`.
6. Put the endpoint's signing secret in `STRIPE_WEBHOOK_SECRET`.

To forward webhooks locally, install the Stripe CLI and run:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the signing secret printed by the CLI into `.env.local`. Use the test checkout flow before enabling live billing.

### Manual Pro activation

The repository includes a protected admin endpoint for manual activation. It requires the `x-admin-secret` header to match `ADMIN_SECRET` and accepts an account email:

```bash
curl -X POST "https://YOUR_DOMAIN/api/admin/upgrade" \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -d '{"email":"customer@example.com"}'
```

Treat this endpoint and its secret as privileged production controls. Manual activation is not payment verification. For automated UPI activation, use a payment provider that verifies transactions server-side and activate Pro only from a verified provider webhook.

## Deploy to Vercel

1. Import this repository into Vercel.
2. Add the required environment variables in **Project Settings → Environment Variables**.
3. Set `NEXT_PUBLIC_SITE_URL` to the deployed origin.
4. Deploy and verify authentication redirects.
5. Configure the Stripe production webhook URL and secret if billing is enabled.
6. Test the report-generation and usage-limit flows in the deployed environment.

The repository includes a `vercel.json` configuration file. Your deployment still needs correctly configured external service credentials.

## API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/core` | `POST` | Authenticates the user, validates input, enforces the free daily limit, masks secrets, calls the model, and stores usage/report data |
| `/api/usage` | `GET` | Returns authenticated account usage and plan status |
| `/api/stripe/checkout` | `POST` | Creates a Stripe subscription Checkout session for the signed-in user |
| `/api/stripe/webhook` | `POST` | Verifies Stripe webhook signatures and updates subscription status for supported events |
| `/api/admin/upgrade` | `POST` | Privileged manual Pro activation, protected by `ADMIN_SECRET` |
| `/api/health` | `GET` | Returns a basic service health response |

## Security and operational notes

- **Keep secrets server-side.** Do not prefix server-only credentials with `NEXT_PUBLIC_`.
- **Review generated reports.** AI output can be incomplete or incorrect; validate technical details before acting on them.
- **Avoid sensitive data.** Secret masking is best-effort and cannot guarantee that every credential or private value is detected. Do not paste production secrets, access tokens, or confidential customer data.
- **Enforce access controls.** Keep Supabase row-level security enabled and review policies before changing the schema.
- **Verify payments.** Trust signed, verified provider webhooks rather than screenshots or unverified payment claims.
- **Monitor usage and costs.** Model calls incur API costs. Usage limits help manage product access, but monitor provider usage and configure suitable billing alerts.
- **Test before launch.** Validate sign-in, report generation, daily limits, subscription activation, cancellation handling, and error paths in a staging environment.

## Project structure

```text
BugBrief/
├── app/
│   ├── api/
│   │   ├── admin/upgrade/       # Privileged manual plan activation
│   │   ├── core/                # Main report-generation endpoint
│   │   ├── health/              # Health response
│   │   ├── stripe/              # Checkout and webhook handlers
│   │   └── usage/               # Usage and plan status
│   ├── auth/                    # Login, signup, and callback routes
│   ├── dashboard/               # Main workspace
│   └── pricing/                 # Pricing page
├── components/                  # Dashboard, auth, pricing, and shared UI
├── lib/                         # Supabase, Stripe, rate-limit, and utilities
├── supabase/schema.sql          # Database schema and row-level security
├── .env.example                 # Required environment variable names
├── middleware.ts                # Request/auth middleware
└── package.json
```

## Contributing

BugBrief is developed in the open. Contributions that improve report quality, safety, accessibility, reliability, documentation, and developer experience are welcome.

- Read the [contribution guide](./CONTRIBUTING.md) before opening a pull request.
- Review the [security policy](./SECURITY.md) before reporting a vulnerability.
- Check the [project roadmap](./ROADMAP.md) for current priorities; it is a plan, not a delivery guarantee.
- Use the [GitHub issue tracker](https://github.com/Rahulchaube1/BugBrief/issues) for reproducible bugs and feature proposals.

## License

A license file has not yet been added. Public visibility alone does not grant permission to reuse, modify, or redistribute the code. A maintainer must choose and add a license before the project can clearly communicate its open-source reuse terms.

---

**BugBrief** — better bug reports, clearer handoffs, less time lost reconstructing context.
