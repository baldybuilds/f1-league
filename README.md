# F1 Predictions League

A low-effort, season-long F1 predictions app for a private friend group. Pick the WDC and WCC once, pick a top three each race weekend, and compete in cups and head-to-head — built production-ready from day one.

Status: pre-launch, targeting the 2027 season.

## Stack

SvelteKit + TypeScript (strict), deployed to Netlify with `adapter-netlify`.

## Developing

```sh
npm install
npm run dev -- --open
```

## Checks

```sh
npm run check   # svelte-check
npm run lint    # prettier --check + eslint
npm run test    # vitest + playwright
npm run build   # production build
```
