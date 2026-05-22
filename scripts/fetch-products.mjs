import { mkdir, writeFile } from 'fs/promises';
import { createWriteStream } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const HANDLES = [
  { handle: 'garden-ready-vegetable-plants-brinjal', action: 'options', sale: false, badge: null },
  { handle: 'brinjal-saplings', action: 'add', sale: false, badge: null },
  { handle: 'brinjal-country', action: 'options', sale: false, badge: '1' },
  { handle: 'brinjal-black-beauty', action: 'add', sale: false, badge: null },
  { handle: 'brinjal-f1-hybrid-1', action: 'options', sale: true, badge: null },
  { handle: 'brinjal-country1', action: 'options', sale: false, badge: null },
  { handle: 'brinjal-purple', action: 'add', sale: false, badge: null },
];

function toHttps(url) {
  if (!url) return '';
  return url.startsWith('//') ? `https:${url}` : url;
}

function formatPrice(min, max) {
  if (min === max) return `Rs. ${min.toLocaleString('en-IN')}`;
  return `Rs. ${min.toLocaleString('en-IN')}—Rs. ${max.toLocaleString('en-IN')}`;
}

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function fetchProduct(meta) {
  const res = await fetch(
    `https://www.skorganicfarms.com/products/${meta.handle}.js`
  );
  if (!res.ok) throw new Error(`Product ${meta.handle}: ${res.status}`);
  const p = await res.json();
  const priceMin = p.price_min / 100;
  const priceMax = p.price_max / 100;
  const imageUrl = toHttps(p.featured_image);
  const ext = imageUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
  const localImage = `/images/products/${meta.handle}.${ext}`;

  const imgDir = join(root, 'public', 'images', 'products');
  await mkdir(imgDir, { recursive: true });
  try {
    await downloadImage(imageUrl, join(root, 'public', 'images', 'products', `${meta.handle}.${ext}`));
  } catch (e) {
    console.warn(`Image download failed for ${meta.handle}, using CDN URL`);
  }

  return {
    handle: p.handle,
    title: p.title,
    priceMin,
    priceMax,
    priceDisplay: formatPrice(priceMin, priceMax),
    image: imageUrl,
    localImage,
    inStock: p.available,
    sale: meta.sale || (p.compare_at_price_min > 0),
    action: meta.action,
    badge: meta.badge,
    url: `https://www.skorganicfarms.com${p.url}`,
  };
}

async function main() {
  const products = [];
  for (const meta of HANDLES) {
    console.log(`Fetching ${meta.handle}...`);
    products.push(await fetchProduct(meta));
  }
  const out = { products };
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(join(root, 'data', 'products.json'), JSON.stringify(out, null, 2));
  console.log('Saved data/products.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
