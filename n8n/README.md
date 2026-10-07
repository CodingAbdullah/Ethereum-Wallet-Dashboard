# n8n workflows

Version-controlled exports of the n8n workflows behind alerts (Phase 3). Import them in n8n with
**Workflows → Import from file**. The [n8n Community Edition](https://docs.n8n.io/hosting/) is free to self-host
(Docker on any small VM or free-tier host).

| File | What it does |
|---|---|
| `alerts-scheduler.json` | Runs each alert type's check by calling `POST /api/cron/alerts/<type>` on its interval: gas and price every 5 minutes, wallet activity and depegs every 10, validators every 15, approvals, NFT floors and governance every 30, and the market digest and ENS reminders daily at 08:00 UTC. |
| `alerts-router.json` | Receives each alert from the app, checks its HMAC signature, and sends it to Telegram, a Discord webhook or email (Resend). |

The app records every alert in Postgres before it is delivered, and a unique key per alert means a retry or
a second run never sends the same alert twice.

## Setup

1. **App environment** (Vercel): set `CRON_SECRET`, `N8N_WEBHOOK_SECRET` (any long random string),
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`, `ALERTS_FROM_EMAIL`, and run
   `npm run db:migrate` once to create the alerts tables.
2. **n8n environment**: set `APP_URL` (defaults to `https://ethereumdashboard.dev`), `N8N_WEBHOOK_SECRET` (same value
   as the app) and `ALERTS_FROM_EMAIL`, plus `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` so workflows can read them.
   On n8n Cloud, where environment variables aren't available, type the values into the nodes instead.
3. **n8n credentials** (Settings → Credentials):
   - *Header Auth* named **Ethereum Dashboard cron**: name `Authorization`, value `Bearer <CRON_SECRET>`.
   - *Telegram API* named **Ethereum Dashboard bot**: the bot token.
   - *Header Auth* named **Resend**: name `Authorization`, value `Bearer <RESEND_API_KEY>`.
4. Import both workflows, pick the credentials on the nodes that ask for them, and activate them.
5. Copy the router's **production webhook URL** into the app's `N8N_WEBHOOK_URL`. Until it is set, the app
   delivers alerts itself, so alerts work before n8n is running (but nothing runs the checks on a schedule).

### Telegram bot

Create a bot with [@BotFather](https://t.me/BotFather), then point it at the app (the secret stops anyone
else posting to the webhook):

```sh
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d url=https://ethereumdashboard.dev/api/webhooks/telegram \
  -d secret_token=<TELEGRAM_WEBHOOK_SECRET> \
  -d 'allowed_updates=["message"]'
```

Users link a chat from `/alerts`: the page opens `t.me/<bot>?start=<one-time token>`, and pressing **Start**
links that chat. `/stop` in the chat unlinks it.

### Moralis Streams (optional, real-time wallet alerts)

Wallet activity and risky-approval alerts are polled every 10 and 30 minutes. For alerts within a block:

1. In the [Moralis admin](https://admin.moralis.com) → Streams, create a stream with webhook URL
   `https://ethereumdashboard.dev/api/webhooks/moralis`, the chains you support, **native transactions** and
   **contract interactions** (for ERC20 transfers and approvals) turned on, and no addresses.
2. Set `MORALIS_STREAM_ID` (the stream's ID) and `MORALIS_STREAMS_SECRET` (the secret shown under Streams →
   Settings, used to sign deliveries) in the app.

The app adds and removes each subscribed wallet on the stream itself, and stops polling those alert types.

### Signature format

`X-Signature: t=<unix seconds>,v1=<hex>`, where `v1 = HMAC-SHA256(N8N_WEBHOOK_SECRET, "<t>.<raw body>")`.
The router rejects requests older than 5 minutes. Body:

```json
{ "channel": { "kind": "telegram", "target": "123456" }, "title": "…", "message": "…", "url": "https://…", "eventId": 1, "text": "title, message and link as plain text" }
```
