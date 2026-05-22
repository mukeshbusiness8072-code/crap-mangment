import { SITE } from './config.js';

const STORAGE_KEY = 'skof-cart';

export function formatRupee(amount) {
  return `${SITE.currency} ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  dispatchCartUpdate();
}

function dispatchCartUpdate() {
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function getCartTotals(items = getCart()) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal, count };
}

export function addToCart(product, options = {}) {
  const price = options.price ?? product.priceMin;
  const items = getCart();
  const existing = items.find(
    (i) => i.handle === product.handle && i.price === price
  );
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({
      handle: product.handle,
      title: product.title,
      image: product.image,
      price,
      quantity: 1,
      url: product.url,
      note:
        product.priceMin !== product.priceMax
          ? 'Price varies by option'
          : '',
    });
  }
  saveCart(items);
  return items;
}

export function updateQuantity(handle, price, quantity) {
  let items = getCart();
  const item = items.find((i) => i.handle === handle && i.price === price);
  if (!item) return items;
  if (quantity <= 0) {
    items = items.filter((i) => !(i.handle === handle && i.price === price));
  } else {
    item.quantity = quantity;
  }
  saveCart(items);
  return items;
}

export function removeFromCart(handle, price) {
  const items = getCart().filter(
    (i) => !(i.handle === handle && i.price === price)
  );
  saveCart(items);
  return items;
}

export function clearCart() {
  saveCart([]);
}

function ensureCartDrawer() {
  if (document.getElementById('cart-drawer')) return;

  const el = document.createElement('div');
  el.id = 'cart-drawer';
  el.className = 'cart-drawer';
  el.innerHTML = `
    <div class="cart-drawer__backdrop"></div>
    <aside class="cart-drawer__panel" role="dialog" aria-label="Shopping cart">
      <header class="cart-drawer__header">
        <h2>Your cart</h2>
        <button type="button" class="cart-drawer__close" aria-label="Close">&times;</button>
      </header>
      <div class="cart-drawer__body">
        <p class="cart-drawer__empty">Your cart is empty.</p>
        <ul class="cart-drawer__lines"></ul>
      </div>
      <footer class="cart-drawer__footer">
        <div class="cart-drawer__row"><span>Subtotal</span><span id="cart-subtotal">Rs. 0.00</span></div>
        <p class="cart-drawer__coupon">Coupon <strong>${SITE.couponCode}</strong> (${SITE.discountPercent}% off) applied at checkout</p>
        <a href="/checkout.html" class="btn-checkout">Checkout</a>
        <button type="button" class="btn-continue">Continue shopping</button>
      </footer>
    </aside>
  `;
  document.body.appendChild(el);

  el.querySelector('.cart-drawer__backdrop')?.addEventListener('click', closeCart);
  el.querySelector('.cart-drawer__close')?.addEventListener('click', closeCart);
  el.querySelector('.btn-continue')?.addEventListener('click', closeCart);
}

export function openCart() {
  ensureCartDrawer();
  renderCartDrawer();
  document.getElementById('cart-drawer')?.classList.add('open');
  document.body.classList.add('cart-open');
  document.body.style.overflow = 'hidden';
}

export function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.body.classList.remove('cart-open');
  document.body.style.overflow = '';
}

function renderCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;

  const items = getCart();
  const { subtotal, count } = getCartTotals(items);
  const list = drawer.querySelector('.cart-drawer__lines');
  const empty = drawer.querySelector('.cart-drawer__empty');
  const subtotalEl = drawer.querySelector('#cart-subtotal');

  if (!list || !empty) return;

  if (items.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
  } else {
    empty.style.display = 'none';
    list.innerHTML = items
      .map(
        (item) => `
      <li class="cart-line" data-handle="${item.handle}" data-price="${item.price}">
        <img src="${item.image}" alt="" width="64" height="64" />
        <div class="cart-line__info">
          <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
          ${item.note ? `<small>${item.note}</small>` : ''}
          <p>${formatRupee(item.price)}</p>
          <div class="cart-line__qty">
            <button type="button" data-qty="-1" aria-label="Decrease">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty="1" aria-label="Increase">+</button>
          </div>
        </div>
        <button type="button" class="cart-line__remove" aria-label="Remove">&times;</button>
      </li>
    `
      )
      .join('');
  }

  if (subtotalEl) subtotalEl.textContent = formatRupee(subtotal);
  updateCartHeader(count, subtotal);

  list.querySelectorAll('.cart-line').forEach((line) => {
    const handle = line.dataset.handle;
    const price = Number(line.dataset.price);
    line.querySelector('[data-qty="-1"]')?.addEventListener('click', () => {
      const item = getCart().find((i) => i.handle === handle && i.price === price);
      if (item) updateQuantity(handle, price, item.quantity - 1);
      renderCartDrawer();
    });
    line.querySelector('[data-qty="1"]')?.addEventListener('click', () => {
      const item = getCart().find((i) => i.handle === handle && i.price === price);
      if (item) updateQuantity(handle, price, item.quantity + 1);
      renderCartDrawer();
    });
    line.querySelector('.cart-line__remove')?.addEventListener('click', () => {
      removeFromCart(handle, price);
      renderCartDrawer();
    });
  });
}

export function updateCartHeader(count, subtotal) {
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = String(count);
  });
  document.querySelectorAll('.cart-total-text').forEach((el) => {
    el.textContent = formatRupee(subtotal);
  });
}

export function initCart() {
  ensureCartDrawer();
  const { count, subtotal } = getCartTotals();
  updateCartHeader(count, subtotal);

  document.querySelectorAll('.cart-trigger').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  });

  window.addEventListener('cart-updated', () => {
    const totals = getCartTotals();
    updateCartHeader(totals.count, totals.subtotal);
    if (document.getElementById('cart-drawer')?.classList.contains('open')) {
      renderCartDrawer();
    }
  });
}

export function handleAddProduct(product, action) {
  if (action === 'options' && product.priceMin !== product.priceMax) {
    const ok = window.confirm(
      `"${product.title}" has multiple options on the original store.\n\nAdd to cart at starting price ${formatRupee(product.priceMin)}?`
    );
    if (!ok) {
      window.open(product.url, '_blank');
      return false;
    }
  }
  addToCart(product);
  return true;
}
