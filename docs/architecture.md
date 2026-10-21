# Architecture and Trust Boundaries

This document describes the current repository implementation. It is intended to help contributors understand where to make changes and where security review is especially important.

## System overview

- **Next.js App Router** serves the web application and server-side API routes.
- **Supabase Auth** authenticates users; server routes validate the current user from the session.
- **Supabase PostgreSQL** stores profiles, subscription state, usage records, and generated reports.
- **OpenAI API** converts sanitized report text into structured issue data.
- **Stripe Checkout and webhooks** manage the subscription flow when billing is enabled.
- **Vercel** is the documented deployment target; external service configuration remains the deployer's responsibility.

## Report generation flow

1. A signed-in user submits a text description to `POST /api/core`.
2. The route checks authentication and validates that the input is within the documented length bounds.
3. The route reads subscription state and daily usage.
4. Common secret patterns are masked on a best-effort basis.
5. The sanitized text is sent to the configured model with instructions to avoid inventing missing facts.
6. The response is parsed as JSON and returned to the client; sanitized input and generated output are persisted when database writes succeed.

The generated report is a draft. It must not be treated as a verified root-cause analysis, confirmed severity, or proof that a bug can be reproduced.

## Trust boundaries

### Browser to application server

Treat every request body and client-provided field as untrusted. Enforce authentication and authorization on the server, not only in the UI. Never trust a client-supplied user ID, plan status, usage count, price, or payment result.

### Application server to model provider

User text may contain credentials, personal data, proprietary code, or prompt-injection attempts. Secret masking is heuristic and cannot guarantee detection. Avoid sending sensitive production data; keep provider credentials server-side; apply input and output validation; and consider retention requirements before storing reports.

### Application server to Supabase

The service-role key bypasses row-level security. Use it only in server-only code and restrict its use to operations that require administrative privileges. User-scoped reads should use the authenticated session where practical. Review `supabase/schema.sql` whenever tables, policies, or privileged writes change.

### Application server to Stripe

Only a verified Stripe webhook should update subscription state based on payment lifecycle events. Do not grant paid access based on client redirects, screenshots, or unverified claims. Test webhook retries, duplicate events, cancellation, and failed-payment paths before enabling live billing.

## Operational risks to address

- Daily quota checks and usage writes should be made atomic to prevent concurrent requests from exceeding limits.
- Report generation should validate model output against an explicit schema before persisting it.
- Model and database failures should have clear, bounded error behavior.
- Privileged manual plan activation should be disabled unless configured and protected with a strong secret.
- Logs should avoid recording raw user submissions, credentials, and sensitive generated content.
- Subscription status should remain synchronized with relevant Stripe lifecycle events.

These are review priorities, not claims that every item is already implemented. See the [roadmap](../ROADMAP.md) for planned work.
