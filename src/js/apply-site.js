import { SITE } from './config.js';

export function applySiteBranding() {
  document.querySelectorAll('[data-site-name]').forEach((el) => {
    el.textContent = SITE.name;
  });
  document.querySelectorAll('[data-site-tagline]').forEach((el) => {
    el.textContent = SITE.tagline;
  });

  const logo = document.querySelector('.logo');
  if (logo) {
    if (SITE.logo) {
      logo.classList.add('logo--with-image');
      logo.innerHTML = `
        <img src="${SITE.logo}" alt="${SITE.name} logo" class="logo__img" width="56" height="56" />
        <span class="logo__text">
          <span class="logo__name">${SITE.name}</span>
          <span class="logo__tagline">${SITE.tagline}</span>
        </span>
      `;
    } else {
      logo.innerHTML = `${SITE.name}<span>${SITE.tagline}</span>`;
    }
  }

  const ann = document.querySelector('.announcement');
  if (ann) {
    ann.innerHTML = SITE.announcement.includes('AADI15')
      ? SITE.announcement.replace(
          'AADI15',
          `<strong>${SITE.couponCode}</strong>`
        )
      : SITE.announcement;
  }

  document.querySelectorAll('[data-site-year]').forEach((el) => {
    el.textContent = String(SITE.year);
  });
  document.querySelectorAll('[data-site-phone]').forEach((el) => {
    el.textContent = SITE.phone;
  });
  document.querySelectorAll('[data-site-email]').forEach((el) => {
    el.textContent = SITE.email;
  });
  document.querySelectorAll('a[data-site-email-link]').forEach((el) => {
    el.href = `mailto:${SITE.email}`;
    el.textContent = SITE.email;
  });

  const footer = document.querySelector('.footer-bottom');
  if (footer) {
    footer.innerHTML = `&copy; <span data-site-year>${SITE.year}</span>, <span data-site-name>${SITE.name}</span>`;
  }

  const welcomeTitle = document.querySelector('#welcome-popup h2');
  if (welcomeTitle) {
    welcomeTitle.textContent = `Welcome to ${SITE.name}`;
  }
  const welcomeText = document.querySelector('#welcome-popup p');
  if (welcomeText) {
    welcomeText.innerHTML = `Flat ${SITE.discountPercent}% off with code <strong>${SITE.couponCode}</strong> at checkout.`;
  }

  const base = document.title.split('–')[0]?.trim();
  if (base && !document.title.includes(SITE.name)) {
    const part = document.title.includes('–')
      ? document.title.split('–').slice(1).join('–').trim()
      : '';
    document.title = part ? `${base} – ${SITE.name}` : `${SITE.name}`;
  }
}
