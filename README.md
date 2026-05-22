# SK Organic Farms — Search Page Clone

A static replica of the [SK Organic Farms brinjzal search page](https://www.skorganicfarms.com/search?type=product&q=brinjzal), including the same 7 products, prices (INR), and product images from their Shopify CDN.

## Legal notice

This project is for **learning and demo purposes only**. Product images, names, and branding belong to SK Organic Farms / Sunantha Organic Farms. Do not use this clone as a commercial storefront without permission and your own assets.

## Requirements

- [Node.js](https://nodejs.org/) 18+ (includes `npm`)

## Quick start (easiest)

**Double-click `START-SITE.bat`** in the project folder. It will try Node.js (Vite) or Python to start a local server and open the search page in your browser.

## Quick start (manual)

```bash
cd "c:\Users\Mukesh muki\OneDrive\Documents\crap mangment"
npm install
npm run dev
```

Open: **http://localhost:5173/catalog.html** (all **325 products**)

Search example: **http://localhost:5173/search.html?q=brinjal**

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run fetch:all` | Download **all 325 products** + prices from skorganicfarms.com |
| `npm run fetch` | Download only the 7 brinjal products (legacy) |

## Project structure

- `catalog.html` — **All 325 products** (main shop page)
- `search.html` — Search results (uses same product database)
- `data/all-products.json` — Full catalog (titles, prices, images from SK Organic Farms)
- `data/products.json` — Legacy 7 brinjal products only
- `src/css/` — Layout and component styles
- `src/js/search.js` — Grid render, sort, filters
- `scripts/fetch-products.mjs` — Optional refresh from Shopify `.js` endpoints

## Upload / refresh all products

Whenever SK Organic Farms updates prices, run:

```bash
python scripts/fetch-all-products.py
```

This rebuilds `data/all-products.json` with every product and the same INR prices as the live store.

## Your own brand name

Edit [`src/js/config.js`](src/js/config.js):

```js
export const SITE = {
  name: 'Your Farm Shop',        // your store name
  tagline: 'Organic living',     // subtitle under logo
  phone: '+91-XXXXXXXXXX',
  email: 'you@email.com',
  // ...
};
```

Refresh the page — logo, footer, and titles update automatically.

## Shopping cart

- Click **Add** on any product (or **Options** → confirm starting price)
- Cart icon shows item count and total
- **Checkout** applies coupon discount (demo order, saved in browser)

## Features

- **325 products** — seeds, saplings, grow bags, manure, tools, food, packages, etc.
- **Working cart** (localStorage — persists after refresh)
- Pagination (24 products per page)
- Announcement bar (AADI15 coupon message)
- Header with Seeds / Garden / Others menus
- Search box (navigates to `search.html?q=...`)
- Sidebar filters: availability, price range
- Sort: relevance, price low/high
- Product cards with Sale / Options / Add buttons (demo toasts)
- Typo-friendly search: `brinjzal` still shows brinjal products

## Without Node.js

If npm is not installed, install Node.js first, then run the commands above. The site must be served (not opened as `file://`) so `products.json` can load.
