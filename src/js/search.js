import { initProductPage } from './catalog-page.js';

initProductPage({
  defaultQuery: 'brinjzal',
  pageTitle: 'Search',
  showQueryInTitle: true,
}).catch((err) => {
  console.error(err);
  const grid = document.querySelector('#product-grid');
  if (grid) {
    grid.innerHTML = `<p class="no-results">Could not load products. Run <code>python scripts/fetch-all-products.py</code> then start the server with <strong>START-SITE.bat</strong>.</p>`;
  }
});
