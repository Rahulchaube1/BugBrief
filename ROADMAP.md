# BugBrief Roadmap

This roadmap describes priorities, not delivery guarantees. Work may change as feedback, security findings, and maintainer capacity evolve. Check GitHub Issues for current implementation status.

## Current foundation

- [x] Next.js and TypeScript application
- [x] Supabase authentication and PostgreSQL persistence
- [x] AI-assisted structured bug-report generation
- [x] Markdown output for issue trackers
- [x] Server-side usage tracking and plan checks
- [x] Stripe Checkout and signed webhook integration
- [x] Public setup documentation and CI build workflow

## Priority 1 — Trust, correctness, and security

- [ ] Add automated tests for report validation, secret masking, and quota behavior.
- [ ] Make quota reservation atomic so concurrent requests cannot exceed a user's allowance.
- [ ] Validate and normalize model output before storing or returning it.
- [ ] Add request timeouts, safe error handling, and explicit provider-failure behavior.
- [ ] Reconcile subscription status from Stripe subscription lifecycle events.
- [ ] Review service-role access, database policies, and privileged admin operations.
- [ ] Establish dependency update and vulnerability triage practices.

## Priority 2 — Developer workflow

- [ ] Add export presets for GitHub Issues, Jira, and Linear.
- [ ] Improve missing-information prompts and uncertainty signaling.
- [ ] Add user-controlled report history, retention, and deletion.
- [ ] Improve keyboard navigation, accessibility, and empty/error states.
- [ ] Document deployment, backup, and recovery procedures.

## Priority 3 — Maintainer automation

- [ ] Introduce pull-request checks that include tests and type validation.
- [ ] Add a release checklist and versioned changelog.
- [ ] Evaluate opt-in AI-assisted issue triage and pull-request review with human approval.
- [ ] Track reliability and cost metrics without collecting unnecessary user content.

## Principles

1. **Never fabricate evidence.** Unknown reproduction details must remain unknown.
2. **Human review stays in the loop.** AI output is a draft, not proof of root cause or severity.
3. **Privacy by default.** Do not send secrets or personal data to model providers intentionally; secret masking is best-effort and users must review inputs.
4. **Security over convenience.** Billing and authorization decisions must be verified server-side.
5. **Transparent maintenance.** Prioritize reproducible bug reports, focused changes, and clear release notes.

Want to help? See [CONTRIBUTING.md](./CONTRIBUTING.md) and open an issue to discuss a proposed change.
