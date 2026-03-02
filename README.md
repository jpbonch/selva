# selva CLI

CLI client for Selva shopping API.

## Run locally

```bash
npm install
npm run build
node dist/dev-index.js register
```

or

```bash
bun install
bun run build
bun run dist/dev-index.js register
```

`dist/index.js` targets `https://api.selva.com` for production CLI usage.

## Publish to npm

1. Ensure package name `selva` is available or update package name.
2. Build: `npm run build`
3. Publish: `npm publish --access public`
