# Revamp Phase Plan

How Ethereum Dashboard was rebuilt, phase by phase. Every phase is done; the only item left out on purpose is the optional bridge in Phase 5. For what the product does today and how to run it, see the [README](README.md).

**Free-tier rule:** every data source is keyless or on a provider's free plan. Where a feature needed a paid-only endpoint, it was rebuilt on a free alternative.

## Contents
1. [Timeline](#timeline)
2. [Starting audit](#starting-audit)
3. [Replaced providers and endpoints](#replaced-providers-and-endpoints)
4. [Free-plan limits](#free-plan-limits)
5. [Phases](#phases)
   - [Phase 0: Foundation](#phase-0-foundation-done)
   - [Phase 1: Wallet Connection & Accounts](#phase-1-wallet-connection--accounts-done)
   - [Phase 2: Data & Chain Expansion](#phase-2-data--chain-expansion-done)
   - [Phase 3: Real-Time & n8n Automations](#phase-3-real-time--n8n-automations-done)
   - [Phase 4: AI Layer (MCP Server + Agent)](#phase-4-ai-layer--mcp-server--agent-done)
   - [Phase 5: On-Chain Actions](#phase-5-on-chain-actions-done)
   - [Phase 6: Polish & Growth](#phase-6-polish--growth-done)

---

## Timeline

| Phase | Duration | Status |
|---|---|---|
| 0: Foundation | 1 week | Done |
| 1: Wallet connection & accounts | 1–2 weeks | Done |
| 2: Data & chain expansion | 2–3 weeks | Done |
| 3: Real-time & n8n automations | 2 weeks | Done |
| 4: AI layer (MCP + agent) | 2 weeks | Done |
| 5: On-chain actions | 2–3 weeks | Done |
| 6: Polish & growth | 2 weeks | Done |

---

## Starting audit

What the codebase looked like before the revamp, and what Phase 0 fixed.

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

Missing at the start, and the phase that added it: wallet connection and accounts (1), layer 2 support (2), real-time data and n8n workflows (3), MCP server and AI agent (4), smart contract writes (5), end-to-end tests (6).

Free endpoints that were available but unused at the start:

| Provider | Endpoint | What It Enables |
|---|---|---|
| CoinGecko Demo | On-chain (GeckoTerminal) endpoints | DEX pools, new pairs, trending pools |
| Etherscan V2 | Other `chainid` values | Multi-chain lookups (check which chains the free plan covers) |
| Ethereum RPC | Blocks, logs, `eth_simulateV1` | Explorer pages, ETH burn tracking, transaction previews |

Free providers identified to fill the gaps (most were added in Phase 2):

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

## Replaced providers and endpoints

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

## Free-plan limits

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

## Phases

Each phase builds on the previous one and ends with something shippable.

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

### Phase 2: Data & Chain Expansion (done)

**2.1 Use free endpoints already available**
| Provider | Endpoint | Feature | Status |
|---|---|---|---|
| Moralis | Wallet DeFi positions | DeFi positions on `/me` and wallet pages | Done |
| Moralis | Token approvals | Approval checker on `/me` and wallet pages, riskiest first (revoke comes in Phase 5) | Done |
| Moralis | Decoded wallet history | Readable activity feed ("Swapped 1 ETH for 3,200 USDC") on `/me` and wallet pages | Done |
| GeckoTerminal | Public API (keyless, separate from the CoinGecko cap) | `/dex-pools`: trending and new pools on Ethereum and L2s, with risk badges | Done |
| Ethereum RPC | Blocks, transactions, logs | Transaction and block detail pages | Done |
| Etherscan V2 | `chainid` parameter | Multi-chain support | Done |

Approvals, DeFi positions and the activity feed load separately from the portfolio numbers on `/me` (`/api/portfolio/insights`), and any wallet page uses `/api/wallet-insights`. Each list notes wallets that failed to load instead of hiding them. If the readable feed fails, `/me` falls back to the Etherscan transaction list.

**2.2 Real Layer 2 support**
- [x] Replace the external links in the "Layer Two Chains" menu with chain-aware pages (`/l2/[chain]`).
- [x] Network selector for Ethereum, Base, Arbitrum, OP Mainnet, Polygon and Linea, driving Moralis's `chain`, Etherscan V2's `chainid`, OpenSea's chain slug and a public RPC per chain. zkSync Era and Scroll are left out because Moralis doesn't cover them; they still appear on `/l2`.
- [x] `/l2`: comparison page using **L2BEAT** (type, risk stage, total value secured) and **DefiLlama** (value locked). L2BEAT's API is unofficial, so its columns hide themselves if it changes or is down.
- [x] Portfolio, snapshots, approvals, DeFi positions and Sign-In with Ethereum work on every supported chain.

**2.3 New pages on free providers**
| Page | Provider | Content |
|---|---|---|
| `/defi` ✅ | DefiLlama open API | TVL by protocol and chain, TVL history, stablecoin supply, DEX volume, fees, and yields (the yields section hides itself if DefiLlama keeps that endpoint on its paid plan) |
| `/eth-supply` ✅ | RPC + Beacon API + CoinGecko | ETH burnt over the last ~24h (measured from fee history, incl. blob fees) vs. estimated issuance, net change and yearly rate |
| `/blobs` ✅ | RPC | Blob usage, blob base fee and fees burnt over ~24h, and which rollups posted blobs in the latest blocks (no Blobscan needed) |
| `/staking` ✅ (expanded) | Beacon API, CoinGecko, DefiLlama, on-chain reads, Lido API | Staking ratio, base reward rate and validator count; liquid staking and (liquid) restaking protocols ranked by value on Ethereum; plus the existing stETH/rETH/cbETH, Rocket Pool and validator queue tables |
| `/derivatives` ✅ | Deribit / OKX / Bybit public APIs | ETH perpetual funding (8h and annualized), open interest and volume per exchange; Deribit options open interest, volume, put/call ratio and largest expiries. Exchanges that block the server's region show as unavailable |
| `/mev` ✅ | Relay data API (Flashbots, Ultra Sound, Agnostic, Titan, Aestus) | Share of blocks via MEV-Boost, relay and builder share, payments to proposers, recent MEV-Boost blocks |
| `/governance` ✅ | Snapshot | Active and recently closed votes for ~20 major DAOs, with leading choice and quorum (Tally's on-chain votes need a key; not added) |
| Risk badges ✅ | GoPlus (keyless) | Danger / caution flags (honeypots, unsellable tokens, owner powers, taxes) on `/me` holdings, ERC20 holdings, token pages and DEX pools |
| Address labels ✅ | Curated list (`src/lib/labels.ts`) | Names for well-known mainnet addresses on explorer pages, approvals and blob posters |
| `/eip-protocols` ✅ (rebuilt) | GitHub `ethereum/EIPs` + `ethereum/ERCs` | Live status on each standard, plus an upgrade tracker read from the meta EIPs (Glamsterdam EIP-7773, Fusaka EIP-7607): EIPs scheduled, considered or included, and the mainnet activation date |

ETH ETF flow data has no reliable free API at the moment, so it is left out.

**2.4 Explorer pages (done)**
- [x] `/tx/[hash]`, `/block/[number]` (and `/block/latest`), `/address/[address]`, `/token/[address]`, server-rendered from free public RPCs so search engines can index them. Add `?chain=base` (or arbitrum, optimism, polygon, linea) for other networks.
- [x] Transactions decode ERC20, ERC721 and ERC1155 transfers and approvals, with token symbols and decimals read on-chain; blocks show gas use, base fee and burnt ETH; addresses show balance, type and (for wallets) activity, approvals and DeFi positions; tokens show supply, plus price, holders and transfers on Ethereum.
- [x] Address labels from the curated list in 2.3 show on explorer pages.

**2.5 Homepage redesign (done)**
- [x] Stat row: ETH price, gas, 24h supply change, share of ETH staked.
- [x] DeFi, layer 2 and Ethereum summary cards linking to their pages; the market overview, chart and trending sections stay below.
- [x] **Cmd+K global search** (also a navbar button and the homepage search box): detects an address, ENS name (resolved on-chain), transaction hash or block number, and finds pages by keyword and coins by name.
- [x] Navbar regrouped into Markets, Ethereum, Layer 2s, Wallets, Tokens & NFTs and More (`src/app/utils/constants/SitePages.ts` feeds both the menus and search).

**Done when:** each new page is live with caching, and wallet pages work on at least 5 chains. ✅ (Ethereum plus 5 networks)

---

### Phase 3: Real-Time & n8n Automations (done)

**3.1 Real-time (done)**
- [x] Live block ticker in the metrics bar (block number, age, base fee, how full) over Server-Sent Events from `/api/live`. Each server instance shares one reading every 3 seconds, so viewers don't multiply RPC calls; no WebSocket provider or Upstash needed.
- [x] Vercel functions can't hold connections open, so each stream runs ~50 seconds and the browser's EventSource reconnects automatically.
- [x] Pending transactions on `/tx` check their status on every new block and refresh once mined (pending results are never cached).

**3.2 Event pipeline (done)**
```
Moralis Streams (free plan) ──────────▶ /api/webhooks/* (signature-verified)
n8n scheduler (gas, prices, validators, ...) ──▶ /api/cron/alerts/*
                         │
                         ▼
            Store event (Postgres) ──▶ n8n webhook (signed)
                         │
                         ▼
      n8n routes to Email (Resend) / Telegram / Discord
```
- [x] Tables: `notification_channels`, `alert_subscriptions` (with each checker's saved state) and `alert_events` (a unique key per alert, so a retry or Moralis's confirmed re-delivery is never sent twice). Migration `drizzle/0002_alerts.sql`.
- [x] `/api/cron/alerts/[type]` runs one alert type for every subscriber (`CRON_SECRET`); n8n calls it on each type's interval, since Vercel Hobby cron only runs daily.
- [x] Alerts go to n8n signed with HMAC-SHA256 and a timestamp (`N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`); n8n rejects unsigned or stale requests and routes to Telegram, Discord or email. Without n8n the app delivers directly.
- [x] Incoming webhooks are verified: Moralis Streams (`/api/webhooks/moralis`, keccak signature) and the Telegram bot (`/api/webhooks/telegram`, secret token). They skip the per-IP rate limit.
- [x] Moralis Streams pushes wallet activity and approvals in real time; the app adds and removes watched addresses as alerts change, and polling stops when Streams is configured. Alchemy Notify was not needed.
- [x] Workflow exports in [`/n8n`](n8n/README.md) (scheduler and router) with setup steps for self-hosting the free Community Edition.

**3.3 Workflows (done)**
1. [x] Daily market digest: ETH, market cap, gas and top movers
2. [x] Watched-wallet activity alerts (incoming/outgoing transactions, optional minimum size)
3. [x] Gas threshold alerts ("tell me when gas is under X gwei")
4. [x] Price alerts for ETH and any top-250 coin
5. [x] Validator alerts: missed attestations, slashing, balance drop (Beacon API)
6. [x] New risky token approval on a watched wallet
7. [x] NFT floor price moves
8. [x] ENS expiry reminders (30, 7 and 1 day)
9. [x] Depeg alerts for stETH/ETH and major stablecoins
10. [x] New governance proposals for the Snapshot spaces the user picks

Each type validates its own settings, keeps state between runs (so it fires once when a threshold is crossed, then waits until it clearly resets), and is tested against fake data.

**3.4 Alerts UI (done)**
- [x] `/alerts`: add Telegram (one-time link to the bot), Discord (webhook checked with a test message) or email (confirmed by link) channels; create, pause and delete alerts; see the last 50 alerts and whether each was delivered. Up to 5 channels and 20 alerts per user.
- [x] `/n8n-workflows` lists the live workflows with Subscribe buttons that open `/alerts` with the type selected.

**Done when:** a signed-in user can set up a wallet alert and receive it on Telegram within one block. ✅ (with Moralis Streams configured; otherwise within 10 minutes)

---

### Phase 4: AI Layer — MCP Server + Agent (done)

**4.1 MCP server (`/api/mcp`) (done)**
- [x] Built with Vercel's `mcp-handler` (MCP SDK v2), serving 20 read-only tools from the shared registry:
  `get_wallet_portfolio`, `get_wallet_pnl`, `get_wallet_activity`, `get_token_approvals`, `get_defi_positions`, `resolve_ens`, `get_gas`, `get_token_price`, `get_market_overview`, `get_nft_collection`, `get_validator_queue`, `get_staking_overview`, `get_defi_tvl`, `get_l2_stats`, `decode_transaction`, `get_address_info`, `check_token_risk`, `get_eth_supply`, `get_governance_proposals`, `get_derivatives`. Wallet tools accept an address or an ENS name.
- [x] Access through per-user API keys (`api_keys` table, stored as SHA-256 hashes, up to 3 per user) with 200 tool calls per key per day (`api_key_usage`), so free-plan provider quotas are protected. Keys go in the `Authorization: Bearer` header, or `?key=` for clients that only take a URL.
- [x] Works as a connector in Claude (Claude Code, Claude Desktop, claude.ai custom connectors), Cursor and other MCP clients.
- [x] `/mcp` page: create and revoke keys, see today's usage, copy the setup for each client, and the tool list.

**4.2 In-app agent ("Ask ETH Dashboard") (done)**
- [x] Chat panel on every page using AI SDK `streamText` (`/api/agent`) and `useChat`, with tool calling (up to 6 steps per answer).
- [x] One shared tool registry in `src/lib/tools/` used by both the agent and the MCP server.
- [x] **Groq** free tier as the default model (`llama-3.3-70b-versatile`); `AGENT_MODEL` picks another. Tool results are trimmed and each IP can ask 20 questions an hour, to stay inside the free tier.
- [x] Knows the connected wallet: "Explain my portfolio risk", "Do I have any risky token approvals?", "Is this token safe?", "Summarize this transaction".
- [x] One-click **Explain** buttons on transaction, address/contract and token pages.

**4.3 Market Insights (done)**
- [x] Firecrawl scraping removed; the model gets CoinGecko data directly and the result is cached for an hour.
- [x] DefiLlama (TVL by chain, DEX volume, stablecoin supply), derivatives (funding, open interest, options put/call) and staking (ratio, APR) added to the prompt. Each extra source is optional, so an outage leaves it out instead of breaking the analysis.

**4.4 Guardrails (done)**
- [x] The agent and MCP server can only read data: every tool is read-only (a test rejects write-like tools), MCP tools carry read-only annotations, and the system prompt forbids claiming to sign or send anything.
- [x] The agent never signs anything. It explains the steps for the user to take in their own wallet; Phase 5 adds the simulate → preview → user-signs flow for suggested transactions.
- [x] It never asks for seed phrases or keys, treats on-chain text (token names, labels) as data rather than instructions, and gives information, not financial advice.

**Done when:** Claude can query wallets through MCP, and the in-app agent answers questions about the connected wallet. ✅

---

### Phase 5: On-Chain Actions (done)

Every write action follows the same flow:
1. Build the transaction.
2. Simulate it with `eth_simulateV1` over RPC (or the **Tenderly** free tier).
3. Show a plain-English preview: balance changes and GoPlus risk flags.
4. The user signs in their own wallet through wagmi.
5. Track it until confirmed, then notify.

**The app never holds private keys.**

How it works: `/api/simulate` runs the transaction(s) with `eth_simulateV1` (viem `simulateCalls`) on the target chain and returns balance changes, the fee and risk flags. Transactions that call an address with no contract are refused. The wallet is switched to the right network, signs and sends; the receipt is read through the wallet's own RPC first. The same panel (`TxFlowPanel`) is used by every feature.

**Features**
1. [x] **Approvals manager (`/approvals`):** lists approvals (Moralis, checked against live on-chain allowances); revoke one or up to 8 at once (`approve(spender, 0)`).
2. [x] **Contract explorer (`/contract`):** loads a verified contract's ABI from Etherscan (free-plan chains) or Sourcify, following EIP-1967 proxies; calls read functions and runs write functions with simulation first.
3. [x] **Swaps (`/swap`):** quotes from Uniswap's on-chain QuoterV2 (all fee tiers, plus two hops via WETH), executed through SwapRouter02 with a deadline and slippage limit; ERC20 inputs get an approval for exactly the amount. Keyless, so no 0x account is needed.
4. [x] **Staking (`/stake`):** stake ETH for stETH (Lido) and rETH (Rocket Pool, deposit pool read from RocketStorage); wrap and unwrap the native coin on every chain.
5. [x] **ENS (`/ens-manager`):** register (commit, wait, register), renew, set primary name and records. Registration and renewal are only offered while the known controller is still authorized by the ENS registrar.
6. [x] **Send (`/send`):** ETH and ERC20 transfers with ENS resolution, contract and own-address warnings, and GoPlus address checks.
7. [ ] **Bridges** (optional): not built. Across's API couldn't be tested here, and a bridge transaction built from an untested API shape is too risky to ship.

The assistant points people to these pages when they want to make a transaction, instead of describing raw wallet steps.

**Done when:** a user can revoke an approval and complete a swap end to end, with a simulation preview, on mainnet and Base. ✅ (tested against local Ethereum and Base chains running the official Uniswap v3 contracts)

---

### Phase 6: Polish & Growth (done)

- [x] **End-to-end tests:** Playwright runs the main flows (lookup, connect, revoke, swap, send, wrap, contract calls, alerts, PWA) on desktop and a phone viewport, against two local Anvil chains with the same chain IDs as Ethereum and Base. `e2e/chain.ts` deploys test tokens, WETH and the official Uniswap v3 contracts (from their npm builds) at the real addresses, so nothing touches a real network and the runs are deterministic. A test wallet (EIP-6963) signs through Anvil. Runs in CI as its own job.
- [x] **SEO:** `sitemap.xml` and `robots.txt` from the site map; dynamic Open Graph images for transaction, address and token pages (live data with a 3-second fallback); a title template and share metadata.
- [x] **Performance:** read-only pages (governance, L2s, DeFi, ETH supply, staking, blobs, MEV, derivatives and the homepage cards) load on the server and stream in with `Suspense`; SWR stays only where data updates live.
- [x] **Mobile & PWA:** installable (web manifest, icons, service worker with an offline page; data is never cached). **Browser push** is a fourth alert channel: Web Push with free VAPID keys, sent straight from the server (never through n8n), limited to the browsers' push services, and switched off automatically when a browser unsubscribes. A notification also appears when a transaction confirms while the tab is in the background.
- [x] **Docs:** `/docs` and `/api/openapi.json` (OpenAPI 3.1) generated from the tool registry's Zod schemas, plus a REST API (`POST /api/v1/tools/{name}`) that shares the MCP server's API keys and daily quota.
- [x] **Product analytics:** a few named events (wallet connected, signed in, channel added, alert created, transaction previewed / confirmed / failed, assistant question, API key created, app installed) sent to Umami and, when `NEXT_PUBLIC_POSTHOG_KEY` is set, to PostHog's free tier for funnels. Privacy first: no addresses, hashes, amounts or free text (only short labels pass a filter), addresses and hashes are stripped from page URLs, and PostHog runs cookieless with no autocapture, recordings or person profiles. Vercel Analytics keeps counting page views.
