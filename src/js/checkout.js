import { SITE } from './config.js';
import {
  getCart,
  getCartTotals,
  updateQuantity,
  removeFromCart,
  clearCart,
  formatRupee,
  initCart,
} from './cart.js';
import { applySiteBranding } from './apply-site.js';
import { initNav } from './nav.js';

function renderCheckout() {
  const items = getCart();
  const list = document.querySelector('#checkout-lines');
  const empty = document.querySelector('#checkout-empty');
  const summary = document.querySelector('#checkout-summary');
  if (!list) return;

  if (items.length === 0) {
    if (empty) empty.style.display = 'block';
    if (summary) summary.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (summary) summary.style.display = 'block';

  list.innerHTML = items
    .map(
      (item) => `
    <li class="checkout-line" data-handle="${item.handle}" data-price="${item.price}">
      <img src="${item.image}" alt="" width="80" height="80" />
      <div>
        <strong>${item.title}</strong>
        ${item.note ? `<br><small>${item.note}</small>` : ''}
        <p>${formatRupee(item.price)} × ${item.quantity}</p>
      </div>
      <div class="checkout-line__actions">
        <button type="button" data-qty="-1">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-qty="1">+</button>
        <button type="button" class="remove">Remove</button>
      </div>
      <div class="checkout-line__total">${formatRupee(item.price * item.quantity)}</div>
    </li>
  `
    )
    .join('');

  const { subtotal } = getCartTotals(items);
  const discount = (subtotal * SITE.discountPercent) / 100;
  const total = subtotal - discount;

  document.querySelector('#checkout-subtotal').textContent = formatRupee(subtotal);
  document.querySelector('#checkout-discount').textContent = `− ${formatRupee(discount)}`;
  document.querySelector('#checkout-total').textContent = formatRupee(total);
  document.querySelector('#checkout-coupon').textContent = SITE.couponCode;

  list.querySelectorAll('.checkout-line').forEach((line) => {
    const handle = line.dataset.handle;
    const price = Number(line.dataset.price);
    line.querySelector('[data-qty="-1"]')?.addEventListener('click', () => {
      const item = getCart().find((i) => i.handle === handle && i.price === price);
      if (item) updateQuantity(handle, price, item.quantity - 1);
      renderCheckout();
    });
    line.querySelector('[data-qty="1"]')?.addEventListener('click', () => {
      const item = getCart().find((i) => i.handle === handle && i.price === price);
      if (item) updateQuantity(handle, price, item.quantity + 1);
      renderCheckout();
    });
    line.querySelector('.remove')?.addEventListener('click', () => {
      removeFromCart(handle, price);
      renderCheckout();
    });
  });
}

function initCheckoutPage() {
  applySiteBranding();
  initNav();
  initCart();
  renderCheckout();

  document.querySelector('#place-order')?.addEventListener('click', () => {
    const items = getCart();
    if (!items.length) return;
    const { subtotal } = getCartTotals(items);
    const total = subtotal - (subtotal * SITE.discountPercent) / 100;
    alert(
      `Order placed (demo)\n\n${SITE.name}\n${items.length} product line(s)\nTotal: ${formatRupee(total)}\n\nWe will contact you at ${SITE.phone}`
    );
    clearCart();
    renderCheckout();
    window.location.href = '/catalog.html';
  });
}

initCheckoutPage();
