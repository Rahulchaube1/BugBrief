# Security Policy

BugBrief processes user-provided text with an AI service and integrates authentication, persistence, and optional billing. Security reports are welcome and should be handled carefully.

## Reporting a vulnerability

**Please do not publish exploitable vulnerabilities, credentials, personal data, or sensitive production details in a public GitHub issue.**

Use GitHub's private vulnerability reporting feature for this repository if it is enabled. If private reporting is unavailable, contact the repository owner through a private channel listed on their public GitHub profile and include only the minimum information needed to reproduce the issue.

Please include:
- A concise description of the affected component and impact.
- Reproduction steps using a local or test environment.
- The relevant commit, route, or configuration.
- Any suggested mitigation, if known.

Do not access, modify, or retain data that is not yours. Do not perform denial-of-service testing or test against production systems without explicit authorization.

## Scope and priorities

Areas of particular interest include:
- Authentication and authorization bypasses.
- Cross-account access to reports or usage records.
- Quota bypasses and unbounded AI/API cost exposure.
- Secret leakage in logs, client bundles, or generated reports.
- Unsafe handling of untrusted input and model output.
- Stripe webhook verification and subscription-state manipulation.
- Misconfigured Supabase row-level security or service-role usage.

## Supported versions

Security fixes are prioritized for the latest version on the default branch. BugBrief is an early-stage project; no formal response-time SLA is promised. Reports will be assessed as promptly as practical.

## Responsible disclosure

Give maintainers a reasonable opportunity to investigate and address a report before public disclosure. Please do not include live secrets or real user content in proof-of-concept material.
