import { applySiteBranding } from './apply-site.js';
import { initCart } from './cart.js';

export function initNav() {
  applySiteBranding();
  initCart();
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  function setMobileNavOpen(open) {
    if (!mobileNav || !toggle) return;
    mobileNav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setMobileNavOpen(!mobileNav.classList.contains('open'));
    });
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMobileNavOpen(false));
    });
    document.addEventListener('click', (e) => {
      if (
        mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        setMobileNavOpen(false);
      }
    });
  }

  document.querySelectorAll('.nav-item').forEach((item) => {
    const btn = item.querySelector('.nav-link');
    if (!btn || btn.tagName !== 'BUTTON') return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.nav-item.open').forEach((el) => {
        el.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-item.open').forEach((el) => {
      el.classList.remove('open');
    });
  });

  const searchForm = document.querySelector('.header-search');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = searchForm.querySelector('input');
      const q = (input?.value || '').trim();
      if (q) {
        const onSearch = /search\.html/i.test(window.location.pathname);
        const target = onSearch ? 'search.html' : 'catalog.html';
        window.location.href = `/${target}?q=${encodeURIComponent(q)}`;
      }
    });
  }

}

export function initFilterDrawer() {
  const btn = document.querySelector('.filter-mobile-btn');
  const sidebar = document.querySelector('.filters-sidebar');
  const backdrop = document.querySelector('.filter-backdrop');
  if (!btn || !sidebar || btn.dataset.filterInit) return;
  btn.dataset.filterInit = '1';

  const close = () => {
    sidebar.classList.remove('open');
    backdrop?.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (!sidebar.querySelector('.filter-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'filter-close';
    closeBtn.setAttribute('aria-label', 'Close filters');
    closeBtn.innerHTML = '&times; Close';
    closeBtn.addEventListener('click', close);
    sidebar.insertBefore(closeBtn, sidebar.firstChild);
  }

  btn.addEventListener('click', () => {
    sidebar.classList.add('open');
    backdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  backdrop?.addEventListener('click', close);
}
