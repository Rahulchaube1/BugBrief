# Contributing to BugBrief

Thank you for helping improve BugBrief. Contributions of all sizes are welcome, including bug reports, documentation fixes, tests, accessibility improvements, and focused feature work.

## Before you start

1. Read the [README](./README.md) to understand the product and local setup.
2. Search existing issues and pull requests to avoid duplicating work.
3. For substantial changes, open an issue first to discuss the problem and proposed solution.
4. Never include real credentials, customer data, private bug reports, or production logs in an issue, test fixture, commit, or pull request.

## Local development

Requirements: Node.js version in `.nvmrc`, npm, and development credentials for the services you intend to test.

```bash
git clone https://github.com/Rahulchaube1/BugBrief.git
cd BugBrief
npm install
cp .env.example .env.local
```

Populate only the environment variables required for your work. Use provider test credentials and test projects; never use production secrets in local development. Start the app with `npm run dev`.

## Pull request checklist

- Keep the change focused and explain the user problem it solves.
- Follow existing TypeScript, React, and Next.js patterns.
- Validate untrusted input on the server and avoid exposing secrets to client code.
- Add or update tests when the project has a suitable test harness; document manual verification when automated coverage is not available.
- Run `npm run build` before opening a pull request.
- Update documentation and `.env.example` when behavior or configuration changes.
- Do not commit `.env.local`, API keys, access tokens, customer data, generated build output, or dependency directories.
- Include screenshots for meaningful UI changes and steps to reproduce fixes.

## Security-sensitive changes

Authentication, authorization, quota enforcement, secret masking, database access, and Stripe webhook changes require extra care. Describe the trust boundary, failure behavior, and verification performed. Do not weaken row-level security or bypass server-side payment verification to make a flow appear to work.

## Commit and review expectations

Use a clear, imperative commit message (for example, `fix: validate report input`). Pull requests should state:

- **Problem:** what is broken or missing?
- **Change:** what did you change and why?
- **Verification:** what commands or manual checks did you run?
- **Risk:** any migration, configuration, billing, or security implications?

Maintainers may request changes, tests, or clarification before merging. Be respectful and assume good intent in discussions.
