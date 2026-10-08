# Ethereum Dashboard

Free Ethereum analytics in one place: wallets, tokens, NFTs, ENS, gas, staking, DeFi and layer 2s, with alerts, an AI assistant, an MCP server and safe, simulated transactions.

**[ethereumdashboard.dev](https://ethereumdashboard.dev)**

Every data source is keyless or on a provider's free plan. How the product was rebuilt is in [PHASEPLAN.md](PHASEPLAN.md).

---

## Contents
1. [Features](#features)
2. [Architecture](#architecture)
3. [Data providers](#data-providers)
4. [Tech stack](#tech-stack)
5. [Getting started](#getting-started)
6. [Environment variables](#environment-variables)
7. [Project structure](#project-structure)
8. [Deployment](#deployment)

---

## Features

**Wallets & portfolio**
- **My Dashboard (`/me`):** sign in with your wallet, save up to 5 wallets and see one combined portfolio: value over time, holdings, activity, token approvals and DeFi positions, with CSV export.
- Token and NFT holdings, transfers, transaction history, net worth and profit & loss for any address.
- GoPlus risk badges on holdings, token pages and DEX pools.

**Markets & DeFi**
- Coin and token prices, global market data, trending coins, top movers and NFT collection stats.
- DeFi TVL, stablecoins, yields, DEX pools (`/defi`, `/dex-pools`), and derivatives: funding, open interest and options (`/derivatives`).
- Hourly AI market insights.

**Ethereum & layer 2s**
- Explorer pages for transactions, blocks, addresses and tokens (`/tx`, `/block`, `/address`, `/token`) on Ethereum and five L2s.
- Gas tracker, ETH supply and burn, blobs, staking and validator queues, MEV-Boost relays, Snapshot governance, ENS lookups and EIP status.
- `/l2` compares layer 2s; `/l2/[chain]` covers each supported network.
- Live block ticker, Cmd+K search, and share images for transaction, address and token links.

**On-chain actions**
Every transaction is simulated and previewed in plain English (balance changes, fee, security warnings) before your own wallet signs it. The site never holds keys.
- Swap (Uniswap v3), send, stake (Lido, Rocket Pool), wrap and unwrap, revoke approvals, call any verified contract, and register or manage ENS names.

**Alerts**
- Ten alert types (wallet activity, gas, prices, validators, risky approvals, NFT floors, ENS expiry, depegs, governance, daily digest) sent to Telegram, Discord, email or browser notifications (`/alerts`).
- Scheduled by n8n; wallet alerts arrive within a block through Moralis Streams. Workflows are in [`n8n/`](n8n/README.md).

**AI & developers**
- **Ask ETH Dashboard:** a chat assistant on every page that reads live data and knows your connected wallet, plus Explain buttons on transaction, contract and token pages.
- **MCP server (`/mcp`):** 20 read-only tools for Claude, Cursor and other MCP clients, with personal API keys.
- **REST API (`/docs`):** the same tools at `POST /api/v1/tools/{name}`, with an OpenAPI 3.1 spec at `/api/openapi.json`.

**App**
- Installable (PWA) with an offline page and push notifications.
- Networks: Ethereum, Base, Arbitrum One, OP Mainnet, Polygon PoS and Linea, plus the Sepolia and Hoodi testnets.

---

## Architecture

```
┌──────────────────────────── Next.js (Vercel) ───────────────────────────┐
│  Pages (server components + streaming) ── wagmi + viem (wallet, SIWE)   │
│            │                                                            │
│  /api/* route handlers ── proxy.ts (cross-site block, per-IP rate limit)│
│            │                                                            │
│  src/lib/tools/ (read-only tool registry) ◀── /api/mcp, /api/v1, agent  │
│            │                                                            │
│  src/lib/providers/ (typed clients: Zod, timeouts, retries, caching)    │
└────────────┬────────────────────────────────────────────────────────────┘
             ▼
  Free plans and keyless APIs (see Data providers)
  Neon Postgres: users, wallets, snapshots, alerts, API keys
  Moralis Streams / n8n schedule ──▶ alert engine ──▶ Telegram · Discord · Email · Web Push
```

- **API routes** validate input with Zod, call a provider client and return JSON. Errors always come back as `{ error }`: 400 bad input, 401 not signed in, 403 cross-site, 429 rate limited, 502 provider failure, 503 not available on the free plan or not configured.
- **Caching:** provider responses use the Next.js data cache, with TTLs tuned to each free plan's limits.
- **Transactions** are simulated with `eth_simulateV1` and signed only in the user's wallet.
- **AI:** the assistant, MCP server and REST API share one registry of read-only tools.

---

## Data providers

| Provider | Plan | Used for |
|---|---|---|
| CoinGecko | Demo (free key) | Prices, market data, trending |
| Moralis | Free key | Holdings, transfers, NFTs, net worth, PnL, approvals, DeFi positions, Streams |
| Etherscan V2 | Free key | Balances and transaction history |
| OpenSea | Free key | NFT floor prices, collection stats, traits |
| Ethplorer | Free (`freekey`) | Top token holders |
| Ethereum and L2 RPCs (PublicNode, public RPCs) | Keyless | Gas, ENS, blocks, simulations, contract reads |
| Beacon API | Keyless | Validators and queues |
| Coinbase, Lido | Keyless | ETH price, stETH APR |
| DefiLlama, L2BEAT, GeckoTerminal | Keyless | DeFi, layer 2s, DEX pools |
| Deribit, OKX, Bybit | Keyless | Derivatives |
| MEV-Boost relays, Snapshot | Keyless | MEV, governance |
| GoPlus, Sourcify | Keyless | Token and address risk, verified contract ABIs |
| Uniswap, Lido, Rocket Pool, ENS contracts | On-chain | Swaps, staking, ENS management |
| Groq | Free tier | AI insights and the assistant |
| Resend, Telegram, Discord, Web Push | Free | Feedback and alert delivery |
| n8n | Community Edition | Alert scheduling |

Moralis's PnL endpoints may need a paid plan; if a free key is rejected, only those tables show as unavailable.

---

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · viem · wagmi · TanStack Query · SWR · Zod · Tailwind CSS 4 · shadcn/ui · Recharts · AG Grid · Neon Postgres · Drizzle ORM · Vercel AI SDK (Groq) · mcp-handler · web-push · Vitest · Playwright + Anvil · Sentry · Upstash Redis · Vercel Analytics · Umami · PostHog (optional)

---

## Getting started

Requires **Node.js 24** (see `.nvmrc`).

```bash
git clone https://github.com/CodingAbdullah/Ethereum-Wallet-Dashboard.git
cd Ethereum-Wallet-Dashboard
npm install
cp .env.example .env     # add your free keys
npm run dev
```

| Script | Does |
|---|---|
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) on local Anvil chains; needs a build and [Foundry](https://getfoundry.sh) |
| `npm run db:migrate` | Create or update the database tables (needs `DATABASE_URL`) |
| `npm run db:generate` | Create a migration after changing `src/lib/db/schema.ts` |

CI runs lint, typecheck, unit tests, build and the end-to-end tests on every pull request.

---

## Environment variables

Every variable is listed and explained in [`.env.example`](.env.example). Most features work without the optional ones, and turn on when they're set.

| Feature | Variables |
|---|---|
| Core data (required) | `ETHERSCAN_API_KEY`, `MORALIS_API_KEY`, `OPENSEA_API_KEY`; `COINGECKO_API_KEY` recommended |
| RPC and beacon overrides | `ETH_RPC_URL`, `RPC_URL_<CHAIN>`, `BEACON_API_URL` (default to free public endpoints) |
| Wallet connection | `NEXT_PUBLIC_REOWN_PROJECT_ID` (WalletConnect) |
| Accounts, `/me`, alerts, API keys | `DATABASE_URL`, `AUTH_SECRET`, `CRON_SECRET` |
| AI | `GROQ_API_KEY`, `AGENT_MODEL` |
| Email (feedback and alerts) | `RESEND_API_KEY`, `PERSONAL_EMAIL`, `ALERTS_FROM_EMAIL` |
| Telegram alerts | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET` |
| Browser notification alerts | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` |
| n8n and real-time alerts | `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `MORALIS_STREAM_ID`, `MORALIS_STREAMS_SECRET` |
| Rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `API_RATE_LIMIT` |
| Monitoring and analytics | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_*`, `UMAMI_URL`, `UMAMI_DATA_WEBSITE_ID`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |

---

## Project structure

```
src/
├── app/            # Pages, route handlers (app/api), components, hooks, manifest
├── lib/
│   ├── providers/  # One client per data provider
│   ├── tools/      # Read-only tools shared by the assistant, MCP server and REST API
│   ├── onchain/    # Transaction building, simulation and risk checks
│   ├── alerts/     # Alert types, engine and delivery
│   ├── auth/, db/  # Sign-In with Ethereum, session, Drizzle schema
│   └── ...         # Chains, portfolio, ENS, staking, OpenAPI, PWA, analytics
└── proxy.ts        # Cross-site block and per-IP rate limit for /api
e2e/                # Playwright tests and local test chains
n8n/                # Alert workflow exports and setup guide
drizzle/            # Database migrations
public/sw.js        # Service worker (offline page, notifications)
```

Unit tests (`*.test.ts`) sit next to the code they test.

---

## Deployment

- **Hosting:** Vercel (route handlers and a daily cron in `vercel.json`). A `Dockerfile` (Node 24) is included for self-hosting:
  ```bash
  docker build -t eth-dashboard .
  docker run -p 3000:3000 --env-file .env eth-dashboard
  ```
- **Database:** set `DATABASE_URL`, `AUTH_SECRET` and `CRON_SECRET`, then run `npm run db:migrate` once, and again after pulling new files in `drizzle/`.
- **Alerts:** create the Telegram bot, register its webhook and import the n8n workflows. Steps are in [`n8n/README.md`](n8n/README.md).
- **Browser notifications:** generate keys once with `npx web-push generate-vapid-keys`.
