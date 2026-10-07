# Ethereum Dashboard

### Live Ethereum Wallet Dashboard for Blockchain Analytics
Explore Ethereum wallets, tokens, NFTs, ENS, gas, staking and market data in one dashboard built with **Next.js** and hosted on **Vercel**.

[Ethereum Dashboard](https://ethereumdashboard.dev)

---

## Table of Contents
1. [Features](#-features)
2. [Data Providers](#-data-providers)
3. [Built With](#️-built-with)
4. [Getting Started](#-getting-started)
5. [Project Structure](#-project-structure)
6. [Audit: Current State & Gaps](#-audit-current-state--gaps)
7. [Roadmap](#️-roadmap)
   - [Phase 0: Foundation](#phase-0--foundation-1-week)
   - [Phase 1: Wallet Connection & Accounts](#phase-1--wallet-connection--accounts-12-weeks)
   - [Phase 2: Data & Chain Expansion](#phase-2--data--chain-expansion-23-weeks)
   - [Phase 3: Real-Time & n8n Automations](#phase-3--real-time--n8n-automations-2-weeks)
   - [Phase 4: AI Layer (MCP Server + Agent)](#phase-4--ai-layer-mcp-server--agent-2-weeks)
   - [Phase 5: On-Chain Actions](#phase-5--on-chain-actions-23-weeks)
   - [Phase 6: Polish & Growth](#phase-6--polish--growth-ongoing)
8. [Target Architecture](#-target-architecture)
9. [Environment Variables](#-environment-variables)
10. [Timeline](#-timeline)
11. [Deployment](#-deployment)

---

## 🚀 Features

### Wallet & Asset Analytics
- **ERC20/721 Holdings:** View all tokens and NFTs in a wallet.
- **ERC20/721 Collection Analytics:** Owners, transfers, sales, floor price, attributes and charts for token and NFT collections.
- **Transactions:** Normal and internal transaction history for any wallet.
- **Wallet Analytics:** Net worth, profit & loss (PnL), PnL breakdown and wallet stats.

### Market Data & Pricing
- **Coin Prices & ERC20 Prices:** Live and historical prices for coins and tokens.
- **Global Market Data:** Total market cap, volume, DeFi market data and market-cap chart.
- **Trending Coins/Collections:** Trending coins and top NFT collections.
- **Top Movers:** Top winning and losing coins.
- **AI Market Insights:** AI-generated market commentary.

### Ethereum Tools
- **ENS:** Address ↔ ENS resolution, resolver records, ownership and transfer history.
- **Gas Tracker:** Gas prices and block-level gas data.
- **Staking/Validators:** Validator queue, validator leaderboard and Rocket Pool statistics.
- **ERC721 Lookups:** Token metadata, rarity, transfers, sales and OpenSea data by token ID.
- **EIP Info:** Notable Ethereum Improvement Proposals.
- **n8n Workflows:** Roadmap section for automated workflows (not live yet, see [Phase 3](#phase-3--real-time--n8n-automations-2-weeks)).

### Networks
- **Ethereum Mainnet** and **Sepolia Testnet** are supported for wallet lookups.
- The "Layer Two Chains" menu currently links out to each L2's website. Native L2 dashboards are planned in [Phase 2](#phase-2--data--chain-expansion-23-weeks).

---

## 🔌 Data Providers

These are the providers the code actually calls, with the number of API routes that use each.

| Provider | Routes | Used For |
|---|---|---|
| **Moralis** | ~27 | ERC20/721 holdings & transfers, ENS, NFT collection data, sales, wallet PnL, stats, net worth, top NFT collections |
| **CoinGecko Pro** | ~15 | Coin & token prices, price history, global market data, DeFi market data, trending, top movers, NFT charts |
| **Etherscan (V2)** | 4 | ETH balance, transaction history, internal transactions |
| **Alchemy (NFT API v3)** | 3 | NFT floor price, rarity, collection attributes |
| **OpenSea (v2)** | 2 | Account and token information |
| **Beaconcha.in** | 3 | Validator queue, validator leaderboard, Rocket Pool stats |
| **Blocknative** | 1 | Gas prices (navbar + gas tracker) |
| **Firecrawl + Groq (Llama 3.3)** | 1 | AI market insights |
| **Resend** | 1 | Feedback form emails |
| **Umami** | n/a | Privacy-friendly site analytics |

> **Note:** Transpose was previously listed as a provider. It is not used by any route, and the service has shut down.

---

## 🛠️ Built With

- **Next.js 16 / React 19:** App Router, route handlers for all provider calls (API keys never reach the browser).
- **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (Radix primitives)
- **Recharts** and **AG Grid** for charts and tables
- **SWR** for client-side data fetching
- **React Hook Form** + **Zod** for forms and schemas
- **Vercel AI SDK** (`ai`, `@ai-sdk/groq`) for AI market insights
- **Lucide React** / **Font Awesome** icons
- **Vercel** hosting and **Vercel Analytics**

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 20.9+** (required by Next.js 16) and **npm**
- API keys for the providers listed above

### Installation
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/CodingAbdullah/Ethereum-Wallet-Dashboard.git
   cd Ethereum-Wallet-Dashboard
   npm install
   ```

2. Create a `.env` file in the project root. These are the variables the code currently reads:
   ```bash
   # Moralis
   MORALIS_API_KEY=''
   MORALIS_API_KEY_2=''

   # CoinGecko Pro
   COINGECKO_GENERIC_API_KEY=''
   COINGECKO_PRICES_API_KEY=''
   COINGECKO_ERC20_PRICES_API_KEY=''
   COINGECKO_CHART_DATA_API_KEY=''
   COINGECKO_NAVBAR_API_KEY=''
   COINGECKO_HOME_PAGE_API_KEY_2=''
   COINGECKO_HOME_PAGE_API_KEY_3=''

   # Etherscan, Alchemy, OpenSea, Beaconcha.in, Blocknative
   ETHERSCAN_API_KEY=''
   ALCHEMY_API_KEY_1=''
   ALCHEMY_API_KEY_2=''
   OPENSEA_API_KEY=''
   BEACON_CHAIN_API_KEY=''
   BLK_API_KEY=''

   # AI market insights
   FIRECRAWL_API_KEY=''
   GROQ_API_KEY=''

   # Feedback email
   RESEND_API_KEY=''
   PERSONAL_EMAIL=''

   # Analytics
   UMAMI_URL=''
   UMAMI_DATA_WEBSITE_ID=''
   ```
   Phase 0 merges these into one key per provider. See [Environment Variables](#-environment-variables) for the target list.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Other scripts:
   ```bash
   npm run build   # production build
   npm run start   # serve the production build
   npm run lint    # lint
   ```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # Route handlers: one per provider call (57 routes)
│   │   └── navbar/          # ETH price + gas for the metrics navbar
│   ├── components/          # Page sections, tables, charts, forms
│   │   └── ui/              # shadcn/ui primitives
│   ├── utils/
│   │   ├── constants/       # Links, lists, prompts, schemas, network map
│   │   ├── functions/       # Fetchers and validators
│   │   └── types/           # Response and component types
│   └── <route>/page.tsx     # Pages (prices, holdings, ENS, gas, staking, ...)
└── lib/utils.ts             # Tailwind class helper
```

---

## 🔍 Audit: Current State & Gaps

This section records what the dashboard has today, what is broken, and what is missing. The roadmap below fixes each item.

### Known bugs
| # | Location | Problem |
|---|---|---|
| 1 | `src/app/api/address-transaction-amount/route.ts` | Calls the retired Etherscan **V1** endpoint (`api.etherscan.io/api`). Must move to V2 (`/v2/api?chainid=1`). |
| 2 | `src/app/api/address-details/route.ts` | `const data = response.json();` is missing `await`, so mainnet and Sepolia lookups return `{}`. |
| 3 | `src/app/components/NetworkSelector.tsx` | Offers **Holesky**, which has been retired. Replace with **Hoodi**. |
| 4 | `Dockerfile` | Uses `node:18-alpine`. Next.js 16 needs Node 20.9+. |
| 5 | Most API routes | Error messages are copy-pasted ("Failed to fetch Ethereum price") and don't describe the real failure. |

### Security and cost
- **No server-side input validation.** `body.address` and `body.network` are concatenated straight into provider URLs. `addressValidator` only runs in the browser and only checks length and the `0x` prefix.
- **No caching.** Every page view calls a paid API.
- **No rate limiting.** Anyone can loop `/api/*` and use up the paid Moralis and CoinGecko quotas.
- **Key sprawl.** Six CoinGecko keys, two Moralis keys and two Alchemy keys are spread across routes.

### Unused or stale
- `@ai-sdk/anthropic`, `@ai-sdk/openai` and `api` are installed but never imported.
- **Market Insights** scrapes the coingecko.com website through Firecrawl, even though the same data is available from the paid CoinGecko Pro API. Scraping is slower, costs more and breaks when the page changes.
- Alchemy is paid for, but only its NFT API is used. Its RPC, Transfers API, Notify webhooks, WebSockets and simulation endpoints are not.

### Missing capabilities
| Area | Status |
|---|---|
| **Wallet connection** | None. No wagmi, viem, RainbowKit, Reown or Sign-In with Ethereum. Users paste an address on every page. |
| **User accounts / persistence** | None. No database, saved wallets, watchlists or alert settings. |
| **Smart contract interaction** | None. Everything goes through third-party REST APIs; no contract reads, writes or simulations. |
| **n8n workflows** | Placeholder page only. One planned card, nothing running. |
| **MCP server / AI agent** | None. The only AI feature is the one-shot market summary. |
| **Real-time data** | None. No WebSockets, webhooks or live block feed. |
| **Layer 2 support** | Menu links to external websites only. |
| **Tests / CI** | No tests and no GitHub Actions. |
| **Error monitoring** | None. |

### Paid endpoints already available but unused
| Provider | Unused Endpoint | What It Enables |
|---|---|---|
| Moralis | Wallet DeFi positions | DeFi positions per wallet |
| Moralis | Token approvals | Approval checker and revoke flow |
| Moralis | Decoded wallet history | Human-readable activity feed |
| CoinGecko Pro | On-chain (GeckoTerminal) | DEX pools, new pairs, trending pools |
| Alchemy | RPC, Transfers, Token API, Notify, WebSockets, Simulation | Fallback data, explorer pages, alerts, live feed, transaction previews |
| Etherscan V2 | Other `chainid` values | Multi-chain lookups (Arbitrum, Base, Optimism, Polygon, ...) |

### Missing providers
| Gap | Provider |
|---|---|
| DeFi TVL, yields, stablecoins, bridges, DEX volume, fees & revenue | **DefiLlama Pro** |
| L2 comparison: TVS, activity, risk stages | **L2BEAT** |
| On-chain analytics: ETH supply, burn vs. issuance, blobs, staking flows | **Dune API** (or Allium) |
| Derivatives: funding, open interest, liquidations | **Coinglass** |
| ETH ETF flows | **SoSoValue** (or Farside) |
| Staking depth: APR, operator performance, LSTs, restaking | **Rated Network**, Lido, EigenLayer APIs |
| MEV, relays, block builders | **Flashbots / relayscan**, EigenPhi |
| Token and contract risk, phishing flags | **GoPlus** (or Blockaid) |
| Entity labels ("Binance 14") | **Arkham** (or Nansen) |
| Blob data | **Blobscan** |
| Governance proposals | **Snapshot**, **Tally** |
| Transaction simulation | **Tenderly** |
| Swap routing | **0x** or **1inch** |
| Live EIP data | GitHub `ethereum/EIPs` |

### Missing Ethereum-specific features
ETH supply and burn tracking, blob fees, staking APR across liquid staking tokens (LSTs), L2 comparison, ETH/BTC ratio, ETF flows, per-wallet DeFi positions, token approvals, portfolio value over time, CSV/tax export, transaction/block/address explorer pages, and a live gas and block feed.

---

## 🗺️ Roadmap

Each phase builds on the previous one and ends with something shippable. Time estimates assume one developer working with an AI coding assistant. Phases 2 and 4 can partly run in parallel once Phase 0's provider clients exist.

### Phase 0: Foundation (1 week)
Every later phase sits on top of the API layer, so it gets fixed first.

**0.1 Bug fixes**
- [ ] Move `api/address-transaction-amount` to Etherscan V2.
- [ ] Add the missing `await` in `api/address-details`.
- [ ] Replace Holesky with Hoodi in `NetworkSelector` and every route that checks for it.
- [ ] Update the `Dockerfile` base image to `node:22-alpine`.
- [ ] Replace the generic error messages with accurate ones.

**0.2 One client per provider**
- [ ] Create `src/lib/providers/`: `moralis.ts`, `coingecko.ts`, `etherscan.ts`, `alchemy.ts`, `opensea.ts`, `beaconchain.ts`, `blocknative.ts`.
- [ ] Each client handles auth headers, Zod response validation, timeouts, retries with backoff, and a fallback provider where one exists (for example, ETH balance from Alchemy RPC if Etherscan fails).
- [ ] Shrink each route to: validate input → call client → return result.

**0.3 Validation and security**
- [ ] Shared Zod schemas for addresses (viem `isAddress` checksum), ENS names, network allowlist, token IDs and pagination.
- [ ] Return `400` on bad input before calling any paid API.
- [ ] Add `proxy.ts` (Next.js 16's replacement for middleware) that only accepts `/api/*` calls from the site's own origin.

**0.4 Cost control**
- [ ] **Upstash Redis** cache with a TTL per data type:

  | Data | TTL |
  |---|---|
  | Prices | 30 s |
  | Gas | 12 s (one block) |
  | Global market data | 5 min |
  | Wallet data | 60 s |
  | NFT metadata | 24 h |

- [ ] **Upstash Ratelimit** per IP on every `/api/*` route.
- [ ] Merge to one key per provider (keep extra keys only if they were split on purpose to stay under rate limits).

**0.5 Tooling**
- [ ] GitHub Actions: lint, typecheck, build and tests on every PR.
- [ ] Vitest tests for provider clients using recorded responses.
- [ ] **Sentry** error monitoring.
- [ ] Remove unused dependencies (`api`, `@ai-sdk/openai`).

**Done when:** every route is validated, cached and rate-limited; CI is green; no known broken routes.

---

### Phase 1: Wallet Connection & Accounts (1–2 weeks)

**1.1 Connect a wallet**
- [ ] Add `wagmi`, `viem`, `@tanstack/react-query` and **Reown AppKit** (or RainbowKit), with a Connect button in the navbar.
- [ ] Support MetaMask, Coinbase Wallet, WalletConnect, Rabby, and passkey/smart wallets.
- [ ] Pre-fill the connected address into every address form.

**1.2 Accounts**
- [ ] **Sign-In with Ethereum (SIWE)** with **Auth.js**. The address is the user ID; no passwords.
- [ ] **Neon Postgres + Drizzle ORM** with these tables:
  - `users`
  - `watched_wallets`
  - `watchlists` (tokens and NFTs)
  - `alert_subscriptions`
  - `notification_channels` (email, Telegram, Discord)
  - `api_keys` (for MCP access in Phase 4)

**1.3 "My Dashboard" (`/me`)**
- [ ] One page with net worth, ETH balance, ERC20 and NFT holdings, PnL, recent activity, staking positions and approvals.
- [ ] Multiple wallets combined into one portfolio view.
- [ ] Portfolio value over time, using daily snapshots saved by a Vercel cron job.
- [ ] CSV export (also a starting point for tax reporting).

**Done when:** a user can connect, sign in, save wallets and see one combined portfolio.

---

### Phase 2: Data & Chain Expansion (2–3 weeks)

**2.1 Use paid endpoints already available**
| Provider | Endpoint | Feature |
|---|---|---|
| Moralis | Wallet DeFi positions | DeFi tab on `/me` and wallet pages |
| Moralis | Token approvals | Approval checker (revoke comes in Phase 5) |
| Moralis | Decoded wallet history | Readable activity feed ("Swapped 1 ETH for 3,200 USDC on Uniswap") |
| CoinGecko Pro | On-chain (GeckoTerminal) | DEX pools, new pairs, trending pools |
| Alchemy | RPC, Transfers, Token API | Fallback data source; transaction and block detail pages |
| Etherscan V2 | `chainid` parameter | Multi-chain support |

**2.2 Real Layer 2 support**
- [ ] Replace the external links in the "Layer Two Chains" menu with chain-aware pages.
- [ ] Add a `ChainSelector` (Ethereum, Arbitrum, Base, Optimism, Polygon, Linea, zkSync, Scroll) that sets the `chain` / `chainid` parameter for Moralis, Etherscan V2 and Alchemy.
- [ ] `/l2`: comparison page using **L2BEAT** (TVS, activity, risk stage) and **DefiLlama** (TVL, bridges).

**2.3 New providers and pages**
| Page | Provider | Content |
|---|---|---|
| `/defi` | DefiLlama Pro | TVL by protocol and chain, yields, stablecoin supply, DEX volume, fees and revenue |
| `/eth-supply` | Dune API + Alchemy RPC | Issuance vs. burn, supply change, blob fees |
| `/blobs` | Blobscan | Blob usage, fees, which rollups post them |
| `/staking` (expanded) | Rated Network, Lido, EigenLayer, Rocket Pool | Staking APR, LST comparison, operator performance, restaking |
| `/derivatives` | Coinglass | Funding rates, open interest, liquidations, long/short ratio |
| `/etf` | SoSoValue | Daily ETH ETF flows and holdings |
| `/mev` | Flashbots / relayscan | Relay and builder share, MEV-boost stats |
| `/governance` | Snapshot, Tally | Active proposals for major protocols |
| Risk badges (site-wide) | GoPlus | Honeypot and scam-token flags on holdings and lookups |
| Address labels (site-wide) | Arkham (or Etherscan labels) | Entity names next to addresses |
| `/eip-protocols` (rebuilt) | GitHub `ethereum/EIPs` | Live EIP status and upcoming-upgrade tracker |

**2.4 Explorer pages**
- [ ] `/tx/[hash]`, `/block/[number]`, `/address/[address]`, `/token/[address]` with decoded logs and address labels. This turns the app from a set of forms into something you can click through, and the pages help search traffic.

**2.5 Homepage redesign**
- [ ] Stat row: ETH price, gas, supply change, staking ratio, ETF flow.
- [ ] Market, DeFi and L2 summary cards, plus a trending section.
- [ ] **Cmd+K global search** that detects an address, ENS name, transaction hash, block number or token.

**Done when:** each new page is live with caching, and wallet pages work on at least 5 chains.

---

### Phase 3: Real-Time & n8n Automations (2 weeks)

**3.1 Real-time**
- [ ] Alchemy WebSocket feeding a live block and gas ticker, plus pending-transaction status for the user's own transactions.
- [ ] Vercel functions can't hold WebSockets open, so use Server-Sent Events backed by Upstash, or a small worker on Fly.io or Railway.

**3.2 Event pipeline**
```
Alchemy Notify webhooks ──▶ /api/webhooks/alchemy (HMAC-verified)
Cron jobs (prices, gas, validators, floors) ──▶ /api/cron/*
                         │
                         ▼
            Store event (Postgres) ──▶ n8n webhook (signed)
                         │
                         ▼
      n8n routes to Email (Resend) / Telegram / Discord / Slack
```
- [ ] Self-host n8n on Railway, or use n8n Cloud.
- [ ] Commit workflow JSON exports to `/n8n/` so they are version-controlled.
- [ ] Sign every webhook with HMAC and reject unsigned requests.

**3.3 Workflows (in shipping order)**
1. [ ] Daily market digest (the card already on `/n8n-workflows`)
2. [ ] Watched-wallet activity alerts (incoming/outgoing transactions, large transfers)
3. [ ] Gas threshold alerts ("tell me when gas is under X gwei")
4. [ ] Price alerts for ETH and watchlist tokens
5. [ ] Validator alerts: missed attestations, slashing, balance drop
6. [ ] New risky token approval on a watched wallet
7. [ ] NFT floor price moves
8. [ ] ENS expiry reminders (30, 7 and 1 day)
9. [ ] Depeg alerts for stETH/ETH and major stablecoins
10. [ ] New governance proposals for protocols the user holds

**3.4 Alerts UI**
- [ ] `/alerts`: create and manage subscriptions, view alert history.
- [ ] Rebuild `/n8n-workflows` to list live workflows with Subscribe buttons instead of roadmap cards.

**Done when:** a signed-in user can set up a wallet alert and receive it on Telegram within one block.

---

### Phase 4: AI Layer — MCP Server + Agent (2 weeks)

**4.1 MCP server (`/api/mcp`)**
- [ ] Built with Vercel's `mcp-handler`, reusing the Phase 0 provider clients as tools:
  `get_wallet_portfolio`, `get_wallet_pnl`, `resolve_ens`, `get_gas`, `get_token_price`, `get_nft_collection`, `get_validator`, `get_defi_tvl`, `decode_transaction`, `get_l2_stats`, and more.
- [ ] Access through per-user API keys (`api_keys` table) with a quota per key.
- [ ] Users can add the dashboard as a connector in Claude, Cursor and other MCP clients.
- [ ] `/mcp` page with setup instructions.

**4.2 In-app agent ("Ask ETH Dashboard")**
- [ ] Chat panel using AI SDK `streamText` with tool calling.
- [ ] One shared tool registry in `src/lib/tools/` used by both the agent and the MCP server.
- [ ] **Claude** (`@ai-sdk/anthropic`, already installed) for reasoning-heavy answers; **Groq** for cheap, fast summaries.
- [ ] Knows the connected wallet. Example questions: "Explain my portfolio risk", "Why did my PnL drop this week?", "Is this token safe?", "Summarize this transaction".
- [ ] One-click **Explain** buttons on transaction and contract pages.

**4.3 Rebuild Market Insights**
- [ ] Drop Firecrawl scraping. Feed the model data from CoinGecko, DefiLlama, Coinglass and ETF flows directly.
- [ ] Generate the summary once per hour on a cron job, cache it, and serve the cached version to everyone.

**4.4 Guardrails**
- [ ] The agent can only read data.
- [ ] Any transaction it suggests goes through the Phase 5 simulate → preview → user-signs flow. The agent never signs anything.

**Done when:** Claude can query wallets through MCP, and the in-app agent answers questions about the connected wallet.

---

### Phase 5: On-Chain Actions (2–3 weeks)

Every write action follows the same flow:
1. Build the transaction.
2. Simulate it with **Tenderly** (or Alchemy's simulation endpoint).
3. Show a plain-English preview: balance changes and GoPlus risk flags.
4. The user signs in their own wallet through wagmi.
5. Track it until confirmed, then notify.

**The app never holds private keys.**

**Features**
1. [ ] **Approvals manager:** list approvals; revoke one or many (`approve(spender, 0)`).
2. [ ] **Contract explorer:** load a verified contract's ABI from Etherscan; call read functions and run write functions with simulation first.
3. [ ] **Swaps:** 0x or 1inch aggregator API. An optional integrator fee can help offset API costs.
4. [ ] **Staking:** stake ETH for stETH (Lido) and rETH (Rocket Pool); wrap and unwrap ETH.
5. [ ] **ENS:** register, renew, set primary name and records.
6. [ ] **Send:** ETH and ERC20 transfers with ENS resolution and address risk checks.
7. [ ] **Bridges** (optional): Across or Relay API for moving funds to L2s.

**Done when:** a user can revoke an approval and complete a swap end to end, with a simulation preview, on mainnet and Base.

---

### Phase 6: Polish & Growth (ongoing)

- [ ] **Performance:** server components for read-only pages, `Suspense` streaming, SWR only where data must update live.
- [ ] **Mobile & PWA:** installable app with web push as another alert channel.
- [ ] **SEO:** dynamic Open Graph images for address, token and transaction pages; sitemap.
- [ ] **Product analytics:** PostHog funnels (connect → sign in → alert created), alongside Umami and Vercel Analytics.
- [ ] **Paid tier (optional):** free tier with limited alerts and agent queries; Pro tier with more wallets, alerts and MCP quota to offset API costs.
- [ ] **Docs:** `/docs` with a public API reference generated from the Zod schemas.
- [ ] **End-to-end tests:** Playwright runs of the main flows (lookup, connect, alert, revoke) against a mainnet fork using Anvil.

---

## 🏗️ Target Architecture

```
┌─────────────────────────── Next.js (Vercel) ───────────────────────────┐
│                                                                        │
│  Pages / Server Components ── wagmi + viem (wallet, SIWE, contracts)   │
│            │                                                           │
│            ▼                                                           │
│  /api/* route handlers ── proxy.ts (origin check) ── Upstash Ratelimit │
│            │                                                           │
│            ▼                                                           │
│  src/lib/tools/  (shared tool registry) ◀── /api/mcp  ◀── Claude/Cursor│
│            │                            ◀── in-app agent (AI SDK)      │
│            ▼                                                           │
│  src/lib/providers/  (typed clients, Zod, retries, fallbacks)          │
│            │                                                           │
│            ▼                                                           │
│  Upstash Redis cache                                                   │
└────────────┬───────────────────────────────────────────────────────────┘
             ▼
  Moralis · CoinGecko · Etherscan · Alchemy · OpenSea · Beaconcha.in
  DefiLlama · L2BEAT · Dune · Coinglass · Rated · GoPlus · Arkham
  Tenderly · 0x · Blobscan · Snapshot · Tally · SoSoValue

  Neon Postgres (users, wallets, watchlists, alerts, snapshots, API keys)
  Alchemy Notify / cron ──▶ n8n ──▶ Email · Telegram · Discord · Slack
```

---

## 🔑 Environment Variables

Target list once the roadmap is complete. Current variables are listed under [Getting Started](#-getting-started).

```bash
# Core
DATABASE_URL=''
AUTH_SECRET=''
UPSTASH_REDIS_REST_URL=''
UPSTASH_REDIS_REST_TOKEN=''
SENTRY_DSN=''
CRON_SECRET=''
NEXT_PUBLIC_REOWN_PROJECT_ID=''

# Existing providers (one key each)
MORALIS_API_KEY=''
COINGECKO_API_KEY=''
ETHERSCAN_API_KEY=''
ALCHEMY_API_KEY=''
OPENSEA_API_KEY=''
BEACON_CHAIN_API_KEY=''
BLK_API_KEY=''

# New providers
DEFILLAMA_API_KEY=''
DUNE_API_KEY=''
COINGLASS_API_KEY=''
RATED_API_KEY=''
GOPLUS_API_KEY=''
ARKHAM_API_KEY=''
TENDERLY_ACCESS_KEY=''
ZEROX_API_KEY=''
SOSOVALUE_API_KEY=''

# Pipelines & notifications
ALCHEMY_WEBHOOK_SIGNING_KEY=''
N8N_WEBHOOK_URL=''
N8N_WEBHOOK_SECRET=''
TELEGRAM_BOT_TOKEN=''
DISCORD_WEBHOOK_URL=''
RESEND_API_KEY=''
PERSONAL_EMAIL=''

# AI
ANTHROPIC_API_KEY=''
GROQ_API_KEY=''

# Analytics
UMAMI_URL=''
UMAMI_DATA_WEBSITE_ID=''
```

---

## ⏱️ Timeline

| Phase | Duration | Cumulative |
|---|---|---|
| 0: Foundation | 1 week | 1 week |
| 1: Wallet connection & accounts | 1–2 weeks | 3 weeks |
| 2: Data & chain expansion | 2–3 weeks | 6 weeks |
| 3: Real-time & n8n automations | 2 weeks | 8 weeks |
| 4: AI layer (MCP + agent) | 2 weeks | 10 weeks |
| 5: On-chain actions | 2–3 weeks | 13 weeks |
| 6: Polish & growth | Ongoing | n/a |

---

## 🌐 Deployment

- **Domain:** [ethereumdashboard.dev](https://ethereumdashboard.dev)
- **Hosting:** Vercel (serverless route handlers and cron jobs).
- **Docker:** a `Dockerfile` is included for self-hosting (`docker build -t eth-dashboard . && docker run -p 3000:3000 --env-file .env eth-dashboard`). Update its base image to Node 20.9+ first (see [Known bugs](#known-bugs)).
