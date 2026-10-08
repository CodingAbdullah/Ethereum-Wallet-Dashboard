# Security Policy

Ethereum Dashboard handles wallet sign-in, transaction previews and API keys, so security reports are taken seriously.

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub: open the repository's **Security** tab and choose
**Report a vulnerability**. Don't open a public issue for security problems.

Include what you found, how to reproduce it, and what an attacker could do with it. You should hear back within
a week. Fixes ship as soon as they're ready, and reporters are credited unless they prefer not to be.

## In scope

- Sign-In with Ethereum and session handling
- Transaction building, simulation and previews (anything that could make a user sign something other than what
  the preview shows)
- API keys, quotas and rate limits (`/api/mcp`, `/api/v1/tools`, `proxy.ts`)
- Alert channels and webhooks (Telegram, Discord, email, browser push, n8n, Moralis Streams)
- Leaks of server-side API keys or user data
- Prompt injection that makes the assistant claim to act, or reveal data it shouldn't

## Out of scope

- Data accuracy from third-party providers
- Rate limits of the free providers the dashboard uses
- Attacks that need a compromised wallet, browser or device
- Social engineering

## Design notes

The app never holds private keys or signs transactions: every write is simulated and signed in the user's own
wallet. AI tools are read-only. API keys are stored as SHA-256 hashes.
