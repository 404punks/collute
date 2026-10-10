# Pump.fun data sources

Checked against the public `pump-fun` GitHub organization on 10 October 2026.

Callout Social uses one documented read endpoint. It does not call reverse-engineered frontend routes, advanced analytics hosts, or third-party market APIs.

## Used

### `GET https://frontend-api-v3.pump.fun/coins-v2/{mint}`

| | |
| --- | --- |
| Documented by | [create-coin skill](https://github.com/pump-fun/pump-fun-skills/blob/main/create-coin/SKILL.md) and the same section in the coin-fees and swap skills |
| Reference client | [coin-api.mjs](https://github.com/pump-fun/pump-fun-skills/blob/main/create-coin/scripts/lib/coin-api.mjs) |
| Authentication | None. The official script calls `fetch(url)` with no API key and no bearer token. |
| Permission | Server-side only. The skill says the host is CORS-protected and must not be called from browser JavaScript. |
| Override | `PUMP_COINS_V2_BASE` replaces the prefix, matching the official script. |

What it provides for a single mint, from the published example and a live response of that same endpoint:

- Name, symbol, description (when present), image URI, metadata URI
- Creator wallet
- `created_timestamp` and `last_trade_timestamp`
- `complete`, bonding-curve addresses, reserves, total supply, program
- `market_cap` (unit not defined in the published example; shown raw)
- `usd_market_cap`
- `reply_count` for that coin

What a live response of this endpoint also returned, and this app uses only for display safety or precision:

- `nsfw`, `is_banned`
- `twitter`, `website`, `telegram` when they are `https` URLs
- `total_supply_str` when present, so large supplies are not rounded
- `etag`, `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`, and `x-degraded`

Observed on 10 October 2026 for an unknown mint: HTTP 404 JSON, `x-ratelimit-limit: 60`, `x-ratelimit-remaining`, `x-ratelimit-reset: 60`. Those headers are observations, not a published rate-limit contract. The server caches a successful coin for 30 seconds, retries 429 and 5xx responses, and honors `Retry-After` up to two seconds.

`token_program` is not shown. The official skill says the HTTP value must not be trusted.

`verified`, `volume_1h_usd`, ATH, liquidity, and `security_verdict` can appear in live JSON. They are not in the published example and are not shown. A `verified` flag is not treated as an audit, safety review, or endorsement.

The public coin link `https://pump.fun/coin/{mint}` is built from the mint. coins-v2 does not return it.

If `description` or `image_uri` is missing, the server may fetch the `metadata_uri` returned by coins-v2. That document is the coin's own metadata, not a second Pump API. Failures are ignored.

Caching is in memory on the server only. Full coin payloads are not written to the database. A bookmark stores the snapshot the user saved, labeled with the time it was saved.

## Documented, not used

### `POST https://fun-block.pump.fun/agents/create-coin`

Documented in the same create-coin skill. It builds a partially signed create transaction. Callout Social does not create coins or ask anyone to sign.

### Pump program

`6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`, documented in [pump-public-docs](https://github.com/pump-fun/pump-public-docs). Those docs describe trading instructions, not a Callout feed. This app does not submit transactions.

## Not available

No official document in `pump-fun/pump-public-docs` or `pump-fun/pump-fun-skills` describes:

- A Callout feed, Callout pagination, or a Callout-to-mint relationship
- A trending, newest, or most-discussed coin list
- Search by name or symbol
- A streaming or websocket interface for posts or prices
- Creator profile names, avatars, or verification
- Likes, replies, reposts, or publishing back to Pump.fun
- Global market statistics

Community API maps that capture `advanced-api-v2.pump.fun` or other frontend paths are not official documentation. This app does not call them.

Pump's terms allow automated access only where Pump expressly permits it, and otherwise prohibit crawling the platform to obtain material it does not provide. The coins-v2 read is the access the official skill expressly documents. The app does not crawl pump.fun pages for posts or prices.

## Credentials

No Pump.fun API key, bearer token, or secret is required for the integration this app implements. Do not put a wallet secret or seed phrase in the environment.
