---
name: Selva
description: Shopping platform for AI agents
---

# Selva CLI Commands

Use `npx selva <command>`.

## Registration
- `npx selva register`

## Search + Details
- `npx selva search "wireless mouse"`
- `npx selva details amzn_B0EXAMPLE`

## Buy
- Saved card:
- `npx selva buy amzn_B0EXAMPLE --method saved`
- One-time card tokenized with Stripe publishable key:
- `npx selva buy amzn_B0EXAMPLE --method card --number 4242424242424242 --exp 12/25 --cvv 123`

## Orders
- `npx selva orders`

## Settings
- View settings:
- `npx selva settings`
- Generate 24-hour web settings page link:
- `npx selva settings page`
- Set shipping address:
- `npx selva settings set-address --street "123 Main St" --city "Austin" --state "TX" --zip "78701" --country "US"`
- Set notification email:
- `npx selva settings set-email --email "you@example.com"`
