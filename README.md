# Ethereum Dashboard

### Live Ethereum Wallet Dashboard for Blockchain Analytics
Explore Ethereum wallets, tokens, NFTs, ENS, gas, staking and market data in one dashboard built with **Next.js** and hosted on **Vercel**.

[Ethereum Dashboard](https://ethereumdashboard.dev)

> **Free-tier policy:** every data source this dashboard uses is either keyless or on a provider's **free plan**. Where a feature needed a paid-only endpoint, it was rebuilt on a free alternative. The roadmap below follows the same rule.

---

## Table of Contents
1. [Features](#-features)
2. [Data Providers](#-data-providers)
3. [Built With](#️-built-with)
4. [Getting Started](#-getting-started)
5. [Project Structure](#-project-structure)
6. [How the API Layer Works](#️-how-the-api-layer-works)
7. [Free-Plan Limits](#-free-plan-limits)
8. [Audit: Current State & Gaps](#-audit-current-state--gaps)
9. [Roadmap](#️-roadmap)
   - [Phase 0: Foundation](#phase-0--foundation-done)
   - [Phase 1: Wallet Connection & Accounts](#phase-1--wallet-connection--accounts-done)
   - [Phase 2: Data & Chain Expansion](#phase-2--data--chain-expansion-23-weeks)
   - [Phase 3: Real-Time & n8n Automations](#phase-3--real-time--n8n-automations-2-weeks)
   - [Phase 4: AI Layer (MCP Server + Agent)](#phase-4--ai-layer-mcp-server--agent-2-weeks)
   - [Phase 5: On-Chain Actions](#phase-5--on-chain-actions-23-weeks)
   - [Phase 6: Polish & Growth](#phase-6--polish--growth-ongoing)
10. [Target Architecture](#️-target-architecture)
11. [Environment Variables](#-environment-variables)
12. [Timeline](#️-timeline)
13. [Deployment](#-deployment)

---

## 🚀 Features

### Wallet & Asset Analytics
- **ERC20/721 Holdings:** View all tokens and NFTs in a wallet.
- **ERC20/721 Collection Analytics:** Holders, transfers, sales, floor price, traits and volume stats for token and NFT collections.
- **Transactions:** Normal and internal transaction history for any wallet.
- **Wallet Analytics:** Net worth, profit & loss (PnL), PnL breakdown and wallet stats.

### Market Data & Pricing
- **Coin Prices & ERC20 Prices:** Live and historical prices for coins and tokens.
- **Global Market Data:** Total market cap, volume, DeFi market data and the ETH market-cap chart.
- **Trending Coins/Collections:** Trending coins and top NFT collections by volume.
- **Top Movers:** Top 24-hour gainers and losers among the top 250 coins.
- **AI Market Insights:** Hourly AI-generated market commentary.

### Ethereum Tools
- **ENS:** Address ↔ ENS resolution (on-chain), owned names with expiry and grace periods, and transfer history.
- **Gas Tracker:** Gas estimates at five confidence levels, computed from recent blocks.
- **Staking/Validators:** Validator entry/exit queues, liquid staking tokens (stETH, rETH, cbETH) and Rocket Pool stats.
- **ERC721 Lookups:** Token metadata, trait rarity, transfers, sales and OpenSea data by token ID.
- **EIP Info:** Notable Ethereum Improvement Proposals.
- **n8n Workflows:** Roadmap section for automated workflows (not live yet, see [Phase 3](#phase-3--real-time--n8n-automations-2-weeks)).

### Networks
- **Ethereum Mainnet**, **Sepolia** and **Hoodi** testnets for wallet lookups.
- The "Layer Two Chains" menu currently links out to each L2's website. Native L2 dashboards are planned in [Phase 2](#phase-2--data--chain-expansion-23-weeks).

---

## 🔌 Data Providers

| Provider | Plan | Key needed | Used For |
|---|---|---|---|
| **CoinGecko** | Demo (free) | Free key | Coin & token prices, price history, global market data, trending coins/NFTs, NFT collection data |
| **Moralis** | Free (40k compute units/day) | Free key | Wallet ERC20/NFT holdings and transfers, NFT metadata/transfers/sales, wallet net worth, stats and PnL, ENS holdings |
| **Etherscan V2** | Free (5 calls/s, 100k/day) | Free key | ETH balance, normal and internal transaction history |
| **OpenSea v2** | Free | Free key | NFT floor price, collection stats, trait counts, token rarity, top collections, account and token data |
| **Ethplorer** | Free | Optional (`freekey` by default) | ERC20 top holders |
| **Ethereum RPC** (PublicNode by default) | Free | No | Gas estimates, ENS resolution, Rocket Pool and liquid staking contract reads |
| **Beacon API** (PublicNode by default) | Free | No | Validator entry/exit queues and active validator count |
| **Coinbase Exchange** | Public | No | ETH/USD price and 24h change (CoinGecko is the fallback) |
| **Lido API** | Public | No | stETH APR |
| **Groq** | Free tier | Free key | AI market insights (Llama 3.3 70B) |
| **Resend** | Free (3,000 emails/month) | Free key | Feedback form emails |
| **Umami** | Free / self-hosted | Optional | Privacy-friendly site analytics |

### Replaced providers and endpoints
| Was | Why it changed | Now |
|---|---|---|
| CoinGecko **Pro** API (6 keys) | Paid plan | CoinGecko **Demo** API, one key, aggressive caching |
| CoinGecko `top_gainers_losers` | Paid-only endpoint | Ranked from the free top-250 markets query |
| CoinGecko `global/market_cap_chart` | Paid-only endpoint | ETH market cap chart (free `coins/ethereum/market_chart`) |
| CoinGecko NFT `market_chart` | Paid-only endpoint | OpenSea 24h / 7d / 30d volume & sales stats |
| Blocknative gas API | Service shut down (June 2026) | `eth_feeHistory` over free RPC, same response shape |
| Beaconcha.in API (queue, leaderboard, Rocket Pool) | Free tier ended (May 2026) | Standard Beacon API, on-chain contract reads, Lido API |
| Alchemy `computeRarity`, `summarizeNFTAttributes` | Removed by Alchemy (Sept 30, 2026) | OpenSea traits + token traits |
| Alchemy `getFloorPrice` | Consolidated on one NFT source | OpenSea collection stats |
| Moralis top NFT collections | Endpoint shut down by Moralis | OpenSea collections ordered by 7-day volume |
| Moralis ERC20 owners | Premium (paid) endpoint | Ethplorer top holders |
| Moralis ENS resolve/reverse | Saves free-plan compute units | Viem ENS resolution over free RPC |
| Etherscan **V1** balance endpoint | Retired by Etherscan | Etherscan V2 |
| Firecrawl scrape of coingecko.com | Paid credits, brittle | CoinGecko Demo data already cached by other routes |
| Transpose | Service shut down, unused | Removed |

---

## 🛠️ Built With

- **Node.js 24 LTS**
- **Next.js 16 / React 19:** App Router; all provider calls run in route handlers, so API keys never reach the browser.
- **TypeScript 6** (TypeScript 7 is not supported by `typescript-eslint` yet)
- **Viem** for RPC calls, ENS resolution, contract reads and Sign-In with Ethereum
- **wagmi** + **TanStack Query** for wallet connection
- **Neon Postgres** + **Drizzle ORM** for accounts, **jose** for the session cookie
- **Zod** for request validation
- **Tailwind CSS 4** + **shadcn/ui** (Radix primitives)
- **Recharts** and **AG Grid** for charts and tables
- **SWR** for client-side data fetching
- **Vercel AI SDK** (`ai`, `@ai-sdk/groq`) for AI market insights
- **Vitest** for unit tests
- **Sentry** for error monitoring and **Upstash Redis** for rate limiting (both optional, free tiers)
- **Lucide React** / **Font Awesome** icons
- **Vercel** hosting and **Vercel Analytics**

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 24 LTS** (see `.nvmrc`) and **npm**
- Free API keys for CoinGecko, Etherscan, Moralis, OpenSea, Groq and Resend (links in `.env.example`)

### Installation
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/CodingAbdullah/Ethereum-Wallet-Dashboard.git
   cd Ethereum-Wallet-Dashboard
   npm install
   ```

2. Copy the example environment file and fill in your free keys:
   ```bash
   cp .env.example .env
   ```
   See [Environment Variables](#-environment-variables) for what each one does.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Other scripts:
   ```bash
   npm run build      # production build
   npm run start      # serve the production build
   npm run lint       # ESLint
   npm run typecheck  # TypeScript, no emit
   npm test           # Vitest unit tests
   npm run db:generate  # create a migration after changing src/lib/db/schema.ts
   npm run db:migrate   # apply migrations (needs DATABASE_URL in the environment)
   ```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests and build on every pull request.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # Route handlers, one per feature (validate → provider client → JSON)
│   │   └── navbar/          # ETH price + gas for the metrics navbar
│   ├── components/          # Page sections, tables, charts, forms
│   │   └── ui/              # shadcn/ui primitives
│   ├── hooks/               # useConnectedAddress / usePrefillAddress, useSession (sign-in)
│   ├── me/page.tsx          # My Dashboard (saved wallets)
│   ├── providers.tsx        # wagmi + TanStack Query providers
│   ├── utils/
│   │   ├── constants/       # Links, lists, prompts
│   │   ├── functions/       # Client fetchers and validators
│   │   └── types/           # Response and component types
│   └── <route>/page.tsx     # Pages (prices, holdings, ENS, gas, staking, ...)
├── lib/
│   ├── providers/           # One client per data provider (free plans)
│   ├── api/route.ts         # Shared error handling and body parsing for routes
│   ├── auth/                # SIWE verification, nonces, session cookie
│   ├── db/                  # Drizzle schema and Neon client (migrations in /drizzle)
│   ├── accounts.ts          # Saved wallets for signed-in users
│   ├── portfolio.ts         # Per-wallet holdings, NFTs, PnL, activity; combined portfolio
│   ├── snapshots.ts         # Daily portfolio snapshots and value history
│   ├── csv.ts               # CSV export helpers
│   ├── wagmi.ts             # Wallet connection config
│   ├── validation.ts        # Zod schemas: addresses, networks, ENS names, token IDs, intervals
│   ├── ens.ts               # ENS resolution helpers (viem)
│   ├── ensHoldings.ts       # .eth names owned by an address, with expiry details
│   ├── rateLimit.ts         # Per-IP rate limit (Upstash Redis, or in-memory fallback)
│   └── staking.ts           # Rocket Pool and liquid staking contract reads
├── test/                    # Test helpers and sample provider responses
├── instrumentation.ts         # Sentry setup for the server (no-op without a DSN)
├── instrumentation-client.ts  # Sentry setup for the browser (no-op without a DSN)
└── proxy.ts                 # Blocks cross-site /api calls and rate-limits per IP

Unit tests (`*.test.ts`) sit next to the code they test.
```

---

## ⚙️ How the API Layer Works

Every route handler follows the same pattern:

```ts
export const POST = withErrorHandling(async (request: Request) => {
    const { address, network } = await parseBody(request, addressNetworkBody); // Zod, 400 on bad input
    const data = await moralis('/' + address + '/erc20?chain=' + moralisChain(network), 120); // cached 120s
    return NextResponse.json(data);
});
```

- **Validation:** addresses are checksum-validated with viem; networks, ENS names, coin IDs, token IDs and intervals are checked before any provider is called.
- **Provider clients** (`src/lib/providers/`) handle auth headers, a 15s timeout, one retry on 429/5xx, and typed errors.
- **Caching:** provider responses are stored in the Next.js data cache, so identical requests share one upstream call. Heavier computed results (gas, validator queue, AI insights, staking) are cached with `unstable_cache` or route-level revalidation.
- **Errors:** every route returns `{ error }` with a consistent status code:

  | Status | Meaning |
  |---|---|
  | 400 | Invalid input |
  | 401 | Not signed in, or the sign-in message was invalid |
  | 403 | Cross-site request blocked by `proxy.ts` |
  | 429 | Rate limit (120 requests/minute per IP) |
  | 502 | Provider or RPC failure |
  | 503 | Provider rejected the key, or the endpoint is outside its free plan; or accounts are not configured |

- **Rate limiting:** with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` set, every server instance shares one counter in Upstash Redis (free tier). Without them, each instance counts in memory. If Redis is unreachable, the limiter falls back to memory instead of blocking requests.
- **Caching vs. Upstash:** API responses are cached in the Next.js data cache, which Vercel shares across all instances, so Upstash is not needed for caching on Vercel. When self-hosting with Docker, that cache lives on each container's disk.
- **Error monitoring:** with `NEXT_PUBLIC_SENTRY_DSN` set, unexpected errors (HTTP 500) are reported to Sentry, and provider or RPC failures are reported as warnings. Without a DSN, Sentry is off.

---

## 📏 Free-Plan Limits

| Provider | Limit | How the dashboard stays inside it |
|---|---|---|
| CoinGecko Demo | Monthly call cap (10,000 calls/month at the time of writing) and per-minute rate limit | Shared top-250 markets query; cache TTLs of 15 min (markets), 30 min (trending, lookups), 1 h (global, charts), 6 h (ETH market cap chart); ETH price comes from Coinbase instead |
| Moralis Free | 40,000 compute units/day | Responses cached 2–60 min; ENS resolution moved to free RPC |
| Etherscan Free | 5 calls/s, 100,000/day | 30–60s caching |
| OpenSea | Per-key rate limit | Slugs cached 1 day, stats 10 min, traits 1 h |
| Public RPC / Beacon node | Fair-use rate limits | Gas cached per block, validator queue 10 min, staking 15 min. Set `ETH_RPC_URL` / `BEACON_API_URL` to a free-tier key for headroom |
| Groq Free | Requests/tokens per minute and day | Insights generated at most once an hour and shared by everyone |

> **Moralis PnL and stats:** the wallet profitability and stats endpoints may require a paid Moralis plan. If your free key is rejected, those tables show an error (HTTP 503) and the rest of the dashboard keeps working. There is no free alternative with equivalent PnL data yet.

---

## 🔍 Audit: Current State & Gaps

### Fixed in Phase 0
| Issue | Fix |
|---|---|
| `address-transaction-amount` called the retired Etherscan V1 endpoint | Moved to Etherscan V2 |
| `address-details` was missing an `await` (returned `{}`) | Route was unused by the UI; removed with five other dead routes |
| `coin-information` and `current-ERC20-price` never returned a response | Unused by the UI; removed |
| Holesky testnet (retired) in the network selector | Replaced with Hoodi |
| `Dockerfile` used Node 18 (too old for Next.js 16) | Node 24 LTS, `npm ci` |
| Copy-pasted "Failed to fetch Ethereum price" errors | Shared error handler with accurate messages and status codes |
| No server-side input validation | Zod schemas on every route |
| No caching or rate limiting | Data cache on every provider call; `proxy.ts` rate limit and cross-site block |
| 10 provider keys spread across routes | One key per provider |
| Forms read input refs during render (tables changed as you typed after submitting) | Submitted values captured in state |
| `/prices/[coin]` crashed on an unknown coin | Returns a 404 page |
| Feedback form put raw user text into email HTML | Text is escaped and length-limited |
| `npm run lint` crashed (`next lint` was removed in Next.js 16) | Flat ESLint config, `eslint .` |
| Build failed without a Resend key | Resend client created per request |
| Unused packages (`api`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@mendable/firecrawl-js`, `ethereum-cryptography`) | Removed |

### Still missing
| Area | Status |
|---|---|
| **Wallet connection** | Done in Phase 1: connect, sign in, saved wallets, combined portfolio on `/me`. |
| **User accounts / persistence** | Users, saved wallets and daily portfolio snapshots (Neon). No watchlists or alert settings yet. |
| **Smart contract writes** | None. Reads exist (staking), but no approvals, swaps or transfers. |
| **n8n workflows** | Placeholder page only. |
| **MCP server / AI agent** | None. The only AI feature is the hourly market summary. |
| **Real-time data** | None. Data refreshes by polling. |
| **Layer 2 support** | Menu links to external websites only. |
| **End-to-end tests** | Unit tests cover the API layer; no browser-level tests yet. |

### Free endpoints available but unused
| Provider | Endpoint | What It Enables |
|---|---|---|
| CoinGecko Demo | On-chain (GeckoTerminal) endpoints | DEX pools, new pairs, trending pools |
| Etherscan V2 | Other `chainid` values | Multi-chain lookups (check which chains the free plan covers) |
| Ethereum RPC | Blocks, logs, `eth_simulateV1` | Explorer pages, ETH burn tracking, transaction previews |

### Free providers to add
| Gap | Free Provider |
|---|---|
| DeFi TVL, yields, stablecoins, DEX volume, fees | **DefiLlama** open API (keyless) |
| L2 comparison: TVS, activity, risk stages | **L2BEAT** public API (keyless, unofficial) |
| ETH supply, burn vs. issuance | Computed from **RPC** (base fee × gas used) + **Beacon API** |
| Blob usage and fees | **Blobscan** public API |
| Derivatives: funding, open interest | **Deribit** / **OKX** / **Bybit** public market-data APIs (keyless) |
| MEV-boost relays and builders | **Flashbots relay data API** (public) |
| Token and contract risk | **GoPlus** Security API (free) |
| Address labels | Open label datasets (e.g. `eth-labels`) |
| Governance proposals | **Snapshot** GraphQL (keyless), **Tally** (free key) |
| Transaction simulation | `eth_simulateV1` over RPC, or **Tenderly** free tier |
| Swap quotes | **0x** free tier, or Uniswap's on-chain Quoter contract |
| Live EIP data | GitHub `ethereum/EIPs` |

---

## 🗺️ Roadmap

Each phase builds on the previous one and ends with something shippable. Time estimates assume one developer working with an AI coding assistant. Phases 2 and 4 can partly run in parallel. **Every service below has a free tier.**

### Phase 0: Foundation (done)

- [x] Fix known bugs (Etherscan V1, Holesky, Dockerfile, dead routes, coin page crash, ref-during-render forms, feedback HTML injection)
- [x] One client per provider in `src/lib/providers/` with timeouts, retries, typed errors and caching
- [x] Move every route onto free plans and replace paid-only or shut-down endpoints
- [x] Zod validation on every route; consistent error format
- [x] `proxy.ts`: cross-site block and per-IP rate limit
- [x] One key per provider; `.env.example`
- [x] Working lint (ESLint flat config), `typecheck` script, GitHub Actions CI
- [x] Unit tests (Vitest) for provider clients, validation, error handling, rate limiting, the proxy and key routes, using sample provider responses; run in CI
- [x] Error monitoring with Sentry (free Developer plan), off until `NEXT_PUBLIC_SENTRY_DSN` is set
- [x] Rate limit shared across server instances with Upstash Redis (free tier), with an in-memory fallback

---

### Phase 1: Wallet Connection & Accounts (done)

Shipped in three parts. Each part works on its own; 1.1 needs no database.

**1.1 Connect a wallet (done)**
- [x] `wagmi` + `@tanstack/react-query` with a Connect Wallet button in the navbar. Reown AppKit's wagmi adapter conflicts with wagmi 3's dependencies, so the button uses wagmi's own connectors; WalletConnect still uses a free Reown project ID.
- [x] MetaMask, Rabby and other extensions (EIP-6963), Coinbase Wallet including its passkey smart wallet, and WalletConnect (when `NEXT_PUBLIC_REOWN_PROJECT_ID` is set).
- [x] Wallet providers live in one client component (`src/app/providers.tsx`) with `ssr: true` and cookie storage; the layout stays a server component and pages stay static.
- [x] The connected address is filled into every wallet-address form (`usePrefillAddress`).
- [x] Wallet SDKs load only when the user picks that wallet.

**1.2 Accounts (done; needs `AUTH_SECRET` and `DATABASE_URL` in production)**
- [x] **Sign-In with Ethereum (SIWE)** using viem's built-in SIWE helpers (`createSiweMessage`, `verifySiweMessage`) and a signed, httpOnly session cookie (`jose`). The address is the user ID; no passwords. Auth.js v5 is still in beta, so it is not used.
- [x] Single-use nonces with a short expiry (Upstash Redis when configured, in-memory otherwise); the message's domain, chain and expiry are checked on the server.
- [x] **Neon Postgres** (free tier) + **Drizzle ORM** with only the tables Phase 1 uses:
  - `users`
  - `watched_wallets` (with a `chain` column, ready for Phase 2)
- Later phases add their own tables when they need them: `watchlists` (Phase 2), `alert_subscriptions` and `notification_channels` (Phase 3), `api_keys` (Phase 4).
- [x] The build and every existing page keep working without `DATABASE_URL`; account features return 503 until it is set.
- [x] Unit tests for nonce handling, SIWE verification, the session cookie and the wallets route.
- [x] `/me` page: sign in, then save (up to 5), label and remove wallets. Routes: `/api/auth/{nonce,verify,session,logout}`, `/api/wallets`.

**1.3 "My Dashboard" (`/me`) portfolio (done)**
- [x] Total value, value over time, a per-wallet table (value, token and NFT counts, realized PnL), combined holdings and recent activity.
- [x] Multiple wallets combined into one portfolio view; holdings of the same token are merged across wallets.
- [x] Each section loads on its own; if Moralis PnL is outside the free plan, or a provider is down, that cell says "Unavailable" and the rest of the page still shows. The total warns when a wallet is missing.
- [x] Portfolio value over time from daily snapshots (`portfolio_snapshots`), saved by a daily Vercel cron job (`vercel.json`, `/api/cron/portfolio-snapshots`, protected by `CRON_SECRET`) and whenever `/me` loads. Snapshots are per wallet, so a wallet saved by several users is fetched once.
- [x] A cap on saved wallets per user (5) and on snapshots per cron run (300), so snapshots stay inside Moralis's 40k compute units/day.
- [x] CSV export of holdings (`/api/portfolio/export`), with spreadsheet-formula cells neutralized (token names come from arbitrary contracts).
- Approvals and per-wallet staking positions move to Phase 2, where those data sources are added.

**Done when:** a user can connect, sign in, save wallets and see one combined portfolio. ✅

---

### Phase 2: Data & Chain Expansion (2–3 weeks)

**2.1 Use free endpoints already available**
| Provider | Endpoint | Feature | Status |
|---|---|---|---|
| Moralis | Wallet DeFi positions | DeFi positions on `/me` and wallet pages | Done |
| Moralis | Token approvals | Approval checker on `/me` and wallet pages, riskiest first (revoke comes in Phase 5) | Done |
| Moralis | Decoded wallet history | Readable activity feed ("Swapped 1 ETH for 3,200 USDC") on `/me` and wallet pages | Done |
| CoinGecko Demo | On-chain (GeckoTerminal) | DEX pools, new pairs, trending pools | Planned |
| Ethereum RPC | Blocks, transactions, logs | Transaction and block detail pages | Planned (2.4) |
| Etherscan V2 | `chainid` parameter | Multi-chain support | Planned (2.2) |

Approvals, DeFi positions and the activity feed load separately from the portfolio numbers on `/me` (`/api/portfolio/insights`), and any wallet page uses `/api/wallet-insights`. Each list notes wallets that failed to load instead of hiding them. If the readable feed fails, `/me` falls back to the Etherscan transaction list.

**2.2 Real Layer 2 support**
- [ ] Replace the external links in the "Layer Two Chains" menu with chain-aware pages.
- [ ] Add a `ChainSelector` (Ethereum, Arbitrum, Base, Optimism, Polygon, Linea, zkSync, Scroll) that sets the `chain` / `chainid` parameter for Moralis and Etherscan V2, and picks a public RPC per chain.
- [ ] `/l2`: comparison page using **L2BEAT** (TVS, activity, risk stage) and **DefiLlama** (TVL, bridges).

**2.3 New pages on free providers**
| Page | Provider | Content |
|---|---|---|
| `/defi` ✅ | DefiLlama open API | TVL by protocol and chain, TVL history, stablecoin supply, DEX volume, fees, and yields (the yields section hides itself if DefiLlama keeps that endpoint on its paid plan) |
| `/eth-supply` | RPC + Beacon API | Issuance vs. burn, supply change, blob fees |
| `/blobs` | Blobscan | Blob usage, fees, which rollups post them |
| `/staking` (expanded) | Beacon API, on-chain reads, Lido API | More LSTs, restaking, staking ratio |
| `/derivatives` | Deribit / OKX / Bybit public APIs | ETH funding rates, open interest, options volume |
| `/mev` | Flashbots relay data API | Relay and builder share, MEV-boost payloads |
| `/governance` | Snapshot, Tally | Active proposals for major protocols |
| Risk badges (site-wide) | GoPlus | Honeypot and scam-token flags on holdings and lookups |
| Address labels (site-wide) | Open label datasets | Entity names next to addresses |
| `/eip-protocols` (rebuilt) | GitHub `ethereum/EIPs` | Live EIP status and upcoming-upgrade tracker |

ETH ETF flow data has no reliable free API at the moment, so it is left out.

**2.4 Explorer pages**
- [ ] `/tx/[hash]`, `/block/[number]`, `/address/[address]`, `/token/[address]` with decoded logs and address labels. This turns the app from a set of forms into something you can click through, and the pages help search traffic.

**2.5 Homepage redesign**
- [ ] Stat row: ETH price, gas, supply change, staking ratio.
- [ ] Market, DeFi and L2 summary cards, plus a trending section.
- [ ] **Cmd+K global search** that detects an address, ENS name, transaction hash, block number or token.

**Done when:** each new page is live with caching, and wallet pages work on at least 5 chains.

---

### Phase 3: Real-Time & n8n Automations (2 weeks)

**3.1 Real-time**
- [ ] A WebSocket RPC subscription (free-tier Alchemy/Infura, or PublicNode) feeding a live block and gas ticker, plus pending-transaction status for the user's own transactions.
- [ ] Vercel functions can't hold WebSockets open, so use Server-Sent Events backed by Upstash (free tier), or a small worker on a free host.

**3.2 Event pipeline**
```
Moralis Streams / Alchemy Notify (free tiers) ──▶ /api/webhooks/* (HMAC-verified)
Vercel cron jobs (prices, gas, validators, floors) ──▶ /api/cron/*
                         │
                         ▼
            Store event (Postgres) ──▶ n8n webhook (signed)
                         │
                         ▼
      n8n routes to Email (Resend) / Telegram / Discord / Slack
```
- [ ] Self-host n8n (the Community Edition is free) on a small VM or free-tier host.
- [ ] Commit workflow JSON exports to `/n8n/` so they are version-controlled.
- [ ] Sign every webhook with HMAC and reject unsigned requests.

**3.3 Workflows (in shipping order)**
1. [ ] Daily market digest (the card already on `/n8n-workflows`)
2. [ ] Watched-wallet activity alerts (incoming/outgoing transactions, large transfers)
3. [ ] Gas threshold alerts ("tell me when gas is under X gwei")
4. [ ] Price alerts for ETH and watchlist tokens
5. [ ] Validator alerts: missed attestations, slashing, balance drop (Beacon API)
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
- [ ] Built with Vercel's `mcp-handler`, reusing the provider clients in `src/lib/providers/` as tools:
  `get_wallet_portfolio`, `get_wallet_pnl`, `resolve_ens`, `get_gas`, `get_token_price`, `get_nft_collection`, `get_validator_queue`, `get_defi_tvl`, `decode_transaction`, `get_l2_stats`, and more.
- [ ] Access through per-user API keys (`api_keys` table) with a quota per key, so free-plan provider quotas are protected.
- [ ] Users can add the dashboard as a connector in Claude, Cursor and other MCP clients.
- [ ] `/mcp` page with setup instructions.

**4.2 In-app agent ("Ask ETH Dashboard")**
- [ ] Chat panel using AI SDK `streamText` with tool calling.
- [ ] One shared tool registry in `src/lib/tools/` used by both the agent and the MCP server.
- [ ] **Groq** free tier as the default model. A paid model provider can be added later behind an environment variable.
- [ ] Knows the connected wallet. Example questions: "Explain my portfolio risk", "Why did my PnL drop this week?", "Is this token safe?", "Summarize this transaction".
- [ ] One-click **Explain** buttons on transaction and contract pages.

**4.3 Market Insights**
- [x] Firecrawl scraping removed; the model gets CoinGecko data directly and the result is cached for an hour.
- [ ] Add DefiLlama, derivatives and staking data to the prompt.

**4.4 Guardrails**
- [ ] The agent can only read data.
- [ ] Any transaction it suggests goes through the Phase 5 simulate → preview → user-signs flow. The agent never signs anything.

**Done when:** Claude can query wallets through MCP, and the in-app agent answers questions about the connected wallet.

---

### Phase 5: On-Chain Actions (2–3 weeks)

Every write action follows the same flow:
1. Build the transaction.
2. Simulate it with `eth_simulateV1` over RPC (or the **Tenderly** free tier).
3. Show a plain-English preview: balance changes and GoPlus risk flags.
4. The user signs in their own wallet through wagmi.
5. Track it until confirmed, then notify.

**The app never holds private keys.**

**Features**
1. [ ] **Approvals manager:** list approvals; revoke one or many (`approve(spender, 0)`).
2. [ ] **Contract explorer:** load a verified contract's ABI from Etherscan; call read functions and run write functions with simulation first.
3. [ ] **Swaps:** 0x free tier, or quotes from Uniswap's on-chain Quoter contract.
4. [ ] **Staking:** stake ETH for stETH (Lido) and rETH (Rocket Pool); wrap and unwrap ETH.
5. [ ] **ENS:** register, renew, set primary name and records.
6. [ ] **Send:** ETH and ERC20 transfers with ENS resolution and address risk checks.
7. [ ] **Bridges** (optional): Across API for moving funds to L2s.

**Done when:** a user can revoke an approval and complete a swap end to end, with a simulation preview, on mainnet and Base.

---

### Phase 6: Polish & Growth (ongoing)

- [ ] **Performance:** server components for read-only pages, `Suspense` streaming, SWR only where data must update live.
- [ ] **Mobile & PWA:** installable app with web push as another alert channel.
- [ ] **SEO:** dynamic Open Graph images for address, token and transaction pages; sitemap.
- [ ] **Product analytics:** PostHog free tier funnels (connect → sign in → alert created), alongside Umami and Vercel Analytics.
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
│  /api/* route handlers ── proxy.ts (origin check, rate limit)          │
│            │                                                           │
│            ▼                                                           │
│  src/lib/tools/  (shared tool registry) ◀── /api/mcp  ◀── Claude/Cursor│
│            │                            ◀── in-app agent (AI SDK)      │
│            ▼                                                           │
│  src/lib/providers/  (typed clients, Zod, retries, caching)            │
└────────────┬───────────────────────────────────────────────────────────┘
             ▼
  Free plans: CoinGecko Demo · Moralis · Etherscan · OpenSea · Ethplorer
  Keyless:    Ethereum RPC · Beacon API · Coinbase · Lido · DefiLlama
              L2BEAT · Blobscan · Snapshot · Deribit/OKX · Flashbots relays
  Free tiers: GoPlus · Groq · Resend · Neon · Upstash · Sentry · Reown

  Neon Postgres (users, wallets, watchlists, alerts, snapshots, API keys)
  Moralis Streams / cron ──▶ n8n ──▶ Email · Telegram · Discord · Slack
```

---

## 🔑 Environment Variables

All current variables are in `.env.example`:

| Variable | Required | Free source |
|---|---|---|
| `COINGECKO_API_KEY` | Recommended (works keyless at lower limits) | CoinGecko Demo key |
| `ETHERSCAN_API_KEY` | Yes | Etherscan free key |
| `MORALIS_API_KEY` | Yes | Moralis free plan |
| `OPENSEA_API_KEY` | Yes | OpenSea free key |
| `ETHPLORER_API_KEY` | No (defaults to `freekey`) | Ethplorer free key |
| `ETH_RPC_URL` | No (defaults to PublicNode) | Any free-tier RPC URL |
| `BEACON_API_URL` | No (defaults to PublicNode) | Any beacon node URL |
| `GROQ_API_KEY` | For Market Insights | Groq free tier |
| `RESEND_API_KEY`, `PERSONAL_EMAIL` | For the feedback form | Resend free tier |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Recommended in production | Upstash Redis free tier |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended in production | Sentry free Developer plan |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | No (source map upload only) | Sentry |
| `UMAMI_URL`, `UMAMI_DATA_WEBSITE_ID` | No | Umami |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | For wallet connection (Phase 1) | Reown Cloud free project |
| `DATABASE_URL` | For accounts and `/me` (Phase 1) | Neon free tier |
| `AUTH_SECRET` | For sign-in (Phase 1) | Any random string of 32+ characters (`openssl rand -base64 32`) |
| `CRON_SECRET` | For daily portfolio snapshots | Any random string; Vercel sends it to cron jobs |

Variables later phases will add (all free tiers):
```bash
TALLY_API_KEY=''                 # Tally
N8N_WEBHOOK_URL=''               # n8n
N8N_WEBHOOK_SECRET=''
TELEGRAM_BOT_TOKEN=''
DISCORD_WEBHOOK_URL=''
```

---

## ⏱️ Timeline

| Phase | Duration | Status |
|---|---|---|
| 0: Foundation | 1 week | Done |
| 1: Wallet connection & accounts | 1–2 weeks | Done |
| 2: Data & chain expansion | 2–3 weeks | In progress (2.1 and `/defi` done) |
| 3: Real-time & n8n automations | 2 weeks | Planned |
| 4: AI layer (MCP + agent) | 2 weeks | Planned |
| 5: On-chain actions | 2–3 weeks | Planned |
| 6: Polish & growth | Ongoing | Planned |

---

## 🌐 Deployment

- **Domain:** [ethereumdashboard.dev](https://ethereumdashboard.dev)
- **Hosting:** Vercel (serverless route handlers and cron jobs). Note that Vercel's free Hobby plan is for non-commercial use.
- **Accounts setup:** set `AUTH_SECRET`, `DATABASE_URL` and `CRON_SECRET` in Vercel, then create the tables once with `DATABASE_URL=... npm run db:migrate`. Run it again after pulling new files in `drizzle/`.
- **Cron:** `vercel.json` schedules `/api/cron/portfolio-snapshots` daily at 05:15 UTC; Vercel sends `CRON_SECRET` as a bearer token.
- **Docker:** a `Dockerfile` (Node 24) is included for self-hosting:
  ```bash
  docker build -t eth-dashboard .
  docker run -p 3000:3000 --env-file .env eth-dashboard
  ```
