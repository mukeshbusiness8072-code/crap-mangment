import { initNav, initFilterDrawer } from './nav.js';
import { handleAddProduct } from './cart.js';
import {
  loadAllProducts,
  getQueryParam,
  matchesQuery,
  sortProducts,
  filterProducts,
  renderCard,
  showToast,
  openQuickView,
  initQuickViewModal,
  initWelcomePopup,
  closeQuickView,
  paginate,
  renderPagination,
  PER_PAGE,
} from './products-core.js';

export async function initProductPage(options = {}) {
  const {
    defaultQuery = '',
    pageTitle = 'Products',
    showQueryInTitle = true,
  } = options;

  initNav();
  initFilterDrawer();
  initQuickViewModal();
  initWelcomePopup();
  initQuickViewAddToCart();

  const query = getQueryParam('q', defaultQuery);
  let catalog = await loadAllProducts();
  catalog = catalog.filter((p) => matchesQuery(p, query));

  const maxPrice = Math.ceil(
    Math.max(...catalog.map((p) => p.priceMax), 3000)
  );

  const grid = document.querySelector('#product-grid');
  const sortSelect = document.querySelector('#sort-by');
  const priceRange = document.querySelector('#price-range');
  const priceMaxLabel = document.querySelector('#price-max-label');
  const priceMinLabel = document.querySelector('#price-min-label');
  const inStockCb = document.querySelector('#filter-in-stock');
  const outStockCb = document.querySelector('#filter-out-stock');
  const paginationEl = document.querySelector('#pagination');

  let currentPage = Number(getQueryParam('page', '1')) || 1;

  const state = {
    maxPrice,
    inStockOnly: false,
    outOfStockOnly: false,
  };

  function updateStockCounts(filtered) {
    const inCount = filtered.filter((p) => p.inStock).length;
    const outCount = filtered.filter((p) => !p.inStock).length;
    const inLabel = document.querySelector('#stock-in-count');
    const outLabel = document.querySelector('#stock-out-count');
    if (inLabel) inLabel.textContent = inCount;
    if (outLabel) outLabel.textContent = outCount;
  }

  function updateUI(totalVisible) {
    const countEl = document.querySelector('#result-count');
    const heading = document.querySelector('#page-heading');
    if (heading) {
      if (showQueryInTitle && query) {
        heading.innerHTML = `Search for &ldquo;<span id="search-query">${query}</span>&rdquo;`;
      } else {
        heading.textContent = pageTitle;
      }
    }
    if (countEl) {
      countEl.textContent = `${totalVisible} result${totalVisible !== 1 ? 's' : ''}`;
    }
    const searchInput = document.querySelector('.header-search input');
    if (searchInput) searchInput.value = query;
  }

  function bindCardEvents() {
    grid?.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.product-card');
        const qvBtn = card?.querySelector('.btn-quick-view');
        if (!qvBtn?.dataset.product) return;
        try {
          const product = JSON.parse(decodeURIComponent(qvBtn.dataset.product));
          if (handleAddProduct(product, btn.dataset.action)) {
            showToast(`Added "${product.title}" to cart`);
          }
        } catch {
          showToast('Could not add to cart');
        }
      });
    });
    grid?.querySelectorAll('.btn-quick-view').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          openQuickView(JSON.parse(decodeURIComponent(btn.dataset.product)));
        } catch {
          showToast('Quick view unavailable');
        }
      });
    });
  }

  function render() {
    let list = filterProducts(catalog, state);
    updateStockCounts(list);
    list = sortProducts(list, sortSelect?.value || 'relevance');
    const { page, totalPages, items } = paginate(list, currentPage);
    currentPage = page;

    if (grid) {
      if (items.length === 0) {
        grid.innerHTML =
          '<p class="no-results">No products match your search or filters.</p>';
      } else {
        grid.innerHTML = items.map(renderCard).join('');
        bindCardEvents();
      }
    }

    renderPagination(paginationEl, page, totalPages, (p) => {
      currentPage = p;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      render();
    });

    updateUI(list.length);
  }

  if (priceRange) {
    priceRange.min = 0;
    priceRange.max = maxPrice;
    priceRange.value = maxPrice;
    if (priceMinLabel) priceMinLabel.textContent = 'Rs. 0';
    if (priceMaxLabel)
      priceMaxLabel.textContent = `Rs. ${maxPrice.toLocaleString('en-IN')}`;
    priceRange.addEventListener('input', () => {
      state.maxPrice = Number(priceRange.value);
      if (priceMaxLabel)
        priceMaxLabel.textContent = `Rs. ${state.maxPrice.toLocaleString('en-IN')}`;
      currentPage = 1;
      render();
    });
  }

  sortSelect?.addEventListener('change', () => {
    currentPage = 1;
    render();
  });

  inStockCb?.addEventListener('change', () => {
    if (inStockCb.checked) {
      state.inStockOnly = true;
      state.outOfStockOnly = false;
      outStockCb.checked = false;
    } else state.inStockOnly = false;
    currentPage = 1;
    render();
  });

  outStockCb?.addEventListener('change', () => {
    if (outStockCb.checked) {
      state.outOfStockOnly = true;
      state.inStockOnly = false;
      inStockCb.checked = false;
    } else state.outOfStockOnly = false;
    currentPage = 1;
    render();
  });

  render();
}

function initQuickViewAddToCart() {
  const btn = document.getElementById('qv-add-cart');
  const modal = document.querySelector('#quick-view-modal');
  if (!btn || !modal) return;
  btn.addEventListener('click', () => {
    try {
      const product = JSON.parse(modal.dataset.product || '{}');
      if (product.handle && handleAddProduct(product, product.action || 'add')) {
        showToast(`Added "${product.title}" to cart`);
        closeQuickView();
      }
    } catch {
      showToast('Could not add to cart');
    }
  });
}
