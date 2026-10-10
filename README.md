# Callout Social

A dark, three-column social app for Pump.fun token discovery. Pump.fun coin pages are loaded from the documented `coins-v2` endpoint. Callout posts are not invented, and unofficial Pump APIs are not used.

The name and logo are temporary. Change `src/lib/brand.ts` and `src/components/brand/Logo.tsx` to rebrand.

## What works

- Responsive shell: home, following, trending, explore, token, post, profile, bookmarks, notifications, search, and settings.
- Account registration, sessions, follows, bookmarks, notifications, and platform-native posts.
- Optional browser-wallet connect that reads a public address only.
- `GET https://frontend-api-v3.pump.fun/coins-v2/{mint}` through a server adapter with timeout, retry, rate-limit handling, and a short memory cache.
- Search by mint, and by member name or platform post text.
- Sample Callout cards only when `PUMPFUN_DATA_MODE=mock` and `NODE_ENV` is not `production`. They are labeled as development samples.

## What Pump.fun does not officially provide

These stay empty on purpose:

- The Callout feed and original Callout URLs
- Trending, most discussed, and new-launch rankings
- Name or symbol search of Pump coins
- Live streaming prices
- Likes, replies, reposts, or publishing to Pump.fun
- A verified creator profile

Details, headers, and the credentials answer are in [docs/PUMPFUN_API.md](docs/PUMPFUN_API.md).

## Setup

Requirements: Node.js 22+, npm.

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open http://localhost:3000.

Seeded accounts, both platform-native:

| Email | Password | Username |
| --- | --- | --- |
| demo@callout.social | CalloutDemo!2026 | demo |
| ada@callout.social | CalloutAda!2026 | ada |

`demo` follows `ada`, so `/following` has one post after you sign in as demo.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma SQLite URL, default `file:./dev.db` |
| `PUMPFUN_DATA_MODE` | `live` (default) or `mock`. `mock` is ignored in production. |
| `PUMP_COINS_V2_BASE` | Optional override for the documented coins-v2 prefix |

No Pump API key is used. Do not add wallet secrets.

## Scripts

```bash
npm test
npm run lint
npm run build
npm start
```

## Deployment

`npm run build` creates `prisma/callout.db`, applies the schema, and seeds the demo accounts. That file is gitignored. The build traces it into the server output.

On Vercel the app copies `prisma/callout.db` to `/tmp/callout.db` on first use and points Prisma at that file. The demo account is present after a cold start. Accounts, posts, and bookmarks created on the site stay on that instance until it is replaced, then the seeded database is copied again. A durable database needs a different Prisma provider and a hosted `DATABASE_URL`. SQLite cannot use a Postgres URL.

Local and long-lived hosts keep using `DATABASE_URL` (default `file:./dev.db`):

```bash
npx prisma migrate deploy
npm run db:seed
npm run build
npm start
```

Set `PUMPFUN_DATA_MODE=live`. The Node server must be allowed to reach `frontend-api-v3.pump.fun`. The browser never calls Pump directly.

Keep the process long-lived if you want the in-memory coin cache. Several instances do not share that cache.

## Data rules

Platform posts, follows, bookmarks, and notifications belong to this app. A Pump.fun coin card is labeled `coins-v2`. A development sample is labeled as a sample. Market figures render only when that response includes them, and `market_cap` is shown raw because the published example does not define its unit.
