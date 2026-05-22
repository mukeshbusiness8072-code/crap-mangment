import { initProductPage } from './catalog-page.js';

const q = new URLSearchParams(window.location.search).get('q');

initProductPage({
  defaultQuery: q || '',
  pageTitle: q ? `Search: ${q}` : 'All Products',
  showQueryInTitle: Boolean(q),
}).catch((err) => {
  console.error(err);
  const grid = document.querySelector('#product-grid');
  if (grid) {
    grid.innerHTML = `<p class="no-results">Could not load products. Run <code>python scripts/fetch-all-products.py</code> then <strong>START-SITE.bat</strong>.</p>`;
  }
});
