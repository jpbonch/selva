---
name: Selva
description: Shopping platform for AI agents
---

# Selva CLI

Shopping platform for AI agents. Search, compare, and buy physical products from Amazon through a single CLI.

## Setup

1. `npx selva-cli register` — generates an API key, stored locally at ~/selva/config.json
2. `npx selva-cli settings set-address --street "123 Main St" --city "Austin" --state "TX" --zip "78701" --country "US"` — required before buying
3. Optionally set email for purchase receipts and approval notifications: `npx selva-cli settings set-email --email "you@example.com"`
4. Optionally link a payment card and set an approval threshold at the web settings page: `npx selva-cli settings page`

## Commands

### Search
`npx selva-cli search "<query>"`
Returns up to 10 normalized results with `selva_id`, title, price, rating, source, and url. Requires address for best results but works without one.

### Details
`npx selva-cli details <selva_id>`
Returns full product details from the original provider. Use the `selva_id` from search results (e.g. `amzn_B0EXAMPLE`).

### Buy
`npx selva-cli buy <selva_id> --method <saved|card>`
Requires address to be set. If an approval threshold is configured and the price exceeds it, the order enters a pending state and an approval email is sent.

Options:
- `--method saved` — uses the card linked on the settings page. Fails if no card is linked - ask the user to link one.
- `--method card --number <num> --exp <MM/YY> --cvv <code>` — if you know the card details already or can generate cards. Card details never reach the Selva API.

### Orders
`npx selva-cli orders`
Lists all orders with status: pending, approved, expired, shipping.

### Settings
- `npx selva-cli settings` — view current address, email, approval threshold, and linked card info
- `npx selva-cli settings page` — generates a 24-hour link to the web settings page where a human can link/remove a payment card and set an approval threshold
- `npx selva-cli settings set-address --street <street> --city <city> --state <state> --zip <zip> --country <country>`
- `npx selva-cli settings set-email --email <email>`
- `npx selva-cli settings set-phone --phone <phone>`

## Product ID Format
IDs are prefixed by provider: `amzn_` for Amazon. Pass these to `details` and `buy`.

## Notes
- All data except the API key is stored server-side. The only local file is ~/selva/config.json containing the API key.
- The approval threshold is unset by default (all purchases go through). It can only be enabled by a human via the web settings page.
- Approval links in emails expire after 24 hours. Expired orders show status "expired".
