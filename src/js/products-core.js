const BRINJAL_ALIASES = ['brinjzal', 'brinjal', 'brinj', 'eggplant'];
const PER_PAGE = 24;

export function formatPrice(min, max) {
  if (min === max) return `Rs. ${min.toLocaleString('en-IN')}`;
  return `Rs. ${min.toLocaleString('en-IN')}—Rs. ${max.toLocaleString('en-IN')}`;
}

export function getQueryParam(name, fallback = '') {
  return new URLSearchParams(window.location.search).get(name) || fallback;
}

export function matchesQuery(product, query) {
  const q = query.toLowerCase().trim();
  if (!q || q === '*') return true;
  if (BRINJAL_ALIASES.some((a) => q.includes(a) || a.includes(q))) {
    return product.title.toLowerCase().includes('brinjal');
  }
  const hay = [
    product.title,
    product.type,
    product.vendor,
    ...(product.tags || []),
  ]
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

export async function loadAllProducts() {
  const res = await fetch('./data/all-products.json');
  if (!res.ok) throw new Error('Failed to load all-products.json');
  const data = await res.json();
  return data.products;
}

export function sortProducts(products, sortBy) {
  const list = [...products];
  if (sortBy === 'price-asc') list.sort((a, b) => a.priceMin - b.priceMin);
  else if (sortBy === 'price-desc') list.sort((a, b) => b.priceMax - a.priceMax);
  return list;
}

export function filterProducts(products, state) {
  return products.filter((p) => {
    if (state.inStockOnly && !p.inStock) return false;
    if (state.outOfStockOnly && p.inStock) return false;
    if (p.priceMin > state.maxPrice) return false;
    return true;
  });
}

export function renderCard(product) {
  const price = formatPrice(product.priceMin, product.priceMax);
  const badges = [];
  if (product.sale)
    badges.push('<span class="product-card__badge product-card__badge--sale">Sale</span>');
  if (product.badge)
    badges.push(
      `<span class="product-card__badge product-card__badge--count">${product.badge}</span>`
    );

  const cta =
    product.action === 'add'
      ? '<button type="button" class="btn-product btn-product--add" data-action="add">Add</button>'
      : '<button type="button" class="btn-product" data-action="options">Options</button>';

  const secondaryImg = product.imageSecondary
    ? `<img class="product-card__img-secondary" src="${product.imageSecondary}" alt="" loading="lazy">`
    : '';

  const productJson = encodeURIComponent(JSON.stringify(product));

  return `
    <article class="product-card${product.imageSecondary ? ' has-secondary' : ''}" data-price-min="${product.priceMin}" data-price-max="${product.priceMax}" data-in-stock="${product.inStock}">
      <div class="product-card__media">
        ${badges.join('')}
        <a href="${product.url}" target="_blank" rel="noopener">
          <img class="product-card__img-primary" src="${product.image}" alt="${product.title}" loading="lazy" width="400" height="400">
          ${secondaryImg}
        </a>
        <div class="product-card__actions-overlay">
          <button type="button" class="btn-quick-view" data-product="${productJson}">Quick View</button>
        </div>
      </div>
      <div class="product-card__body">
        <h3 class="product-card__title"><a href="${product.url}" target="_blank" rel="noopener">${product.title}</a></h3>
        <p class="product-card__price">${price}</p>
        <div class="product-card__cta">${cta}</div>
      </div>
    </article>
  `;
}

export function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

export function openQuickView(product) {
  const modal = document.querySelector('#quick-view-modal');
  if (!modal) return;
  modal.querySelector('.qv-image').src = product.image;
  modal.querySelector('.qv-image').alt = product.title;
  modal.querySelector('.qv-title').textContent = product.title;
  modal.querySelector('.qv-price').textContent = formatPrice(
    product.priceMin,
    product.priceMax
  );
  modal.querySelector('.qv-link').href = product.url;
  modal.dataset.product = JSON.stringify({
    ...product,
    action: product.action || 'add',
  });
  const qvAdd = modal.querySelector('#qv-add-cart');
  if (qvAdd) qvAdd.style.display = product.inStock === false ? 'none' : 'inline-block';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeQuickView() {
  const modal = document.querySelector('#quick-view-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

export function initQuickViewModal() {
  const modal = document.querySelector('#quick-view-modal');
  if (!modal) return;
  modal.querySelector('.qv-close')?.addEventListener('click', closeQuickView);
  modal.querySelector('.qv-backdrop')?.addEventListener('click', closeQuickView);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeQuickView();
  });
}

export function initWelcomePopup() {
  const popup = document.querySelector('#welcome-popup');
  if (!popup || sessionStorage.getItem('welcome-dismissed')) return;
  popup.classList.add('open');
  popup.querySelector('.welcome-close')?.addEventListener('click', () => {
    popup.classList.remove('open');
    sessionStorage.setItem('welcome-dismissed', '1');
  });
}

export function paginate(list, page, perPage = PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * perPage;
  return {
    page: p,
    totalPages,
    items: list.slice(start, start + perPage),
  };
}

export function renderPagination(container, page, totalPages, onPage) {
  if (!container) return;
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  let html = '<nav class="pagination" aria-label="Pages">';
  if (page > 1) html += `<button type="button" data-page="${page - 1}">Prev</button>`;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) {
    html += `<button type="button" data-page="${i}" class="${i === page ? 'active' : ''}">${i}</button>`;
  }
  if (page < totalPages) html += `<button type="button" data-page="${page + 1}">Next</button>`;
  html += '</nav>';
  container.innerHTML = html;
  container.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => onPage(Number(btn.dataset.page)));
  });
}

export { PER_PAGE };
