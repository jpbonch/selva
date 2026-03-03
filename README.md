# Selva CLI

Shopping platform CLI for AI agents. Search, inspect, and buy physical products from Amazon through a single interface.

## Quick start

1. Register an API key:

```bash
npx selva-cli register
```

2. Set name (required before buying):

```bash
npx selva-cli settings set-name --name "Jane Doe"
```

3. Set address (required before buying, `--line2` optional):

```bash
npx selva-cli settings set-address --street "123 Main St" --line2 "Apt 4B" --city "Austin" --state "TX" --zip "78701" --country "US"
```

4. Optionally set phone:

```bash
npx selva-cli settings set-phone --phone "+14155551234"
```

5. Optionally set email (for receipts and approval notifications):

```bash
npx selva-cli settings set-email --email "you@example.com"
```

6. Optionally link a card / configure approval threshold via settings page:

```bash
npx selva-cli settings page
```

## Commands

### Search

```bash
npx selva-cli search "<query>"
```

Returns up to 10 normalized results with `selva_id`, title, price, rating, source, and url.

### Details

```bash
npx selva-cli details <selva_id>
```

Returns expanded product details for a result (for example `amzn_B0EXAMPLE`).

### Buy

```bash
npx selva-cli buy <selva_id> --method <saved|card>
```

Requires name and address to be set before placing an order.

Options:

- `--method saved` uses the linked card from settings page.
- `--method card --number <num> --exp <MM/YY> --cvv <code>` uses card details and tokenizes via Stripe.

### Orders

```bash
npx selva-cli orders
```

Lists all orders with status (`pending`, `approved`, `expired`, `shipping`).

### Settings

- `npx selva-cli settings`
- `npx selva-cli settings page`
- `npx selva-cli settings set-address --street <street> [--line2 <line2>] --city <city> --state <state> --zip <zip> --country <country>`
- `npx selva-cli settings set-name --name <name>`
- `npx selva-cli settings set-email --email <email>`
- `npx selva-cli settings set-phone --phone <phone>`

## Product ID format

IDs are prefixed by provider: `amzn_` for Amazon.

## Local development

```bash
npm install
npm run build
node dist/dev-index.js register
```

or

```bash
bun install
bun run build
bun ./dist/dev-index.js register
```

`dist/index.js` targets `https://api.useselva.com` for production usage.

## Publish to npm

```bash
npm run build
npm publish --access public
```

Package name: `selva-cli`.
