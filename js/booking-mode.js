/**
 * Режим бронирования сайта: window.CONFIG.bookingMode — "live" | "placeholder"
 * (генерируется scripts/generate-config.js из BOOKING_MODE в .env).
 * Подключать после js/config.js на страницах с бронированием или ценами из API.
 *
 * "placeholder" (консервация, GS-29): сайт работает как статика без бэкенда —
 * клики по ссылкам онлайн-брони перехватываются и показывают заглушку с контактами,
 * fetch-вызовы к API на страницах обёрнуты в проверку GSBooking.isLive().
 * Расконсервация (GS-16): BOOKING_MODE=live + перегенерация config.js — правок кода не требуется.
 */
(function () {
  'use strict';

  var C = window.CONFIG || {};
  var mode = C.bookingMode === 'live' ? 'live' : 'placeholder';

  function isLive() { return mode === 'live'; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var tg = (C.telegramBot || '').replace(/\/+$/, '');
  var max = C.maxUrl || '';
  var phoneFmt = C.phoneFormatted || C.phone || '';
  var phoneHref = 'tel:' + String(C.phone || '').replace(/[^\d+]/g, '');

  var NOTICE_TEXT = 'Онлайн-бронирование временно недоступно — уточните по телефону или в мессенджере';
  var PRICE_TEXT = 'Цена уточняйте';

  function contactsHtml() {
    var out = '';
    if (tg) {
      out += '<a class="gsbm-btn gsbm-tg" href="' + esc(tg) + '" target="_blank" rel="noopener">Telegram</a>';
    }
    if (max) {
      out += '<a class="gsbm-btn gsbm-max" href="' + esc(max) + '" target="_blank" rel="noopener">MAX</a>';
    }
    if (phoneFmt) {
      out += '<a class="gsbm-btn gsbm-phone" href="' + esc(phoneHref) + '">' + esc(phoneFmt) + '</a>';
    }
    return out;
  }

  window.GSBooking = {
    mode: mode,
    isLive: isLive,
    noticeText: NOTICE_TEXT,
    priceText: PRICE_TEXT,
    // Инлайн-заглушка вместо кнопки онлайн-брони (как существующий fallback на promotions).
    noticeHtml: function (extraClass) {
      return '<span class="gsbm-note ' + esc(extraClass || '') + '">' + NOTICE_TEXT + '</span>';
    },
    // Кнопки контактов для вставки в заглушки/модалку.
    contactsHtml: contactsHtml,
    showModal: showModal
  };

  if (isLive()) return;

  var modalEl = null;

  function injectStyles() {
    if (document.getElementById('gsbm-styles')) return;
    var s = document.createElement('style');
    s.id = 'gsbm-styles';
    s.textContent =
      '.gsbm-note{color:#9ca3af;font-size:0.875rem}' +
      '#gsbm-modal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:1rem}' +
      '#gsbm-modal.gsbm-open{display:flex}' +
      '#gsbm-modal .gsbm-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.6)}' +
      '#gsbm-modal .gsbm-card{position:relative;background:#fff;color:#1a1a1a;max-width:26rem;width:100%;border-radius:.5rem;padding:2rem;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.35)}' +
      '#gsbm-modal .gsbm-close{position:absolute;top:.75rem;right:1rem;font-size:1.5rem;line-height:1;color:#9ca3af;background:none;border:0;cursor:pointer}' +
      '#gsbm-modal .gsbm-close:hover{color:#1a1a1a}' +
      '#gsbm-modal h3{font-family:Georgia,\'Times New Roman\',serif;font-size:1.4rem;margin:0 0 .75rem}' +
      '#gsbm-modal p{color:#6b7280;font-size:.95rem;margin:0 0 1.25rem}' +
      '.gsbm-btn{display:inline-flex;align-items:center;justify-content:center;padding:.7rem 1.4rem;border-radius:.375rem;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;color:#fff}' +
      '.gsbm-tg{background:#0088cc}.gsbm-max{background:#6B4EFF}.gsbm-phone{background:#D4AF37;color:#1a1a1a}' +
      '.gsbm-btns{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}';
    (document.head || document.documentElement).appendChild(s);
  }

  function ensureModal() {
    if (modalEl) return modalEl;
    injectStyles();
    modalEl = document.createElement('div');
    modalEl.id = 'gsbm-modal';
    modalEl.innerHTML =
      '<div class="gsbm-backdrop" data-gsbm-close></div>' +
      '<div class="gsbm-card" role="dialog" aria-modal="true" aria-label="Онлайн-бронирование недоступно">' +
      '<button type="button" class="gsbm-close" data-gsbm-close aria-label="Закрыть">&times;</button>' +
      '<h3>Онлайн-бронирование временно недоступно</h3>' +
      '<p>Напишите нам в Telegram или MAX либо позвоните — подберём вариант и ответим быстро.</p>' +
      '<div class="gsbm-btns">' + contactsHtml() + '</div>' +
      '</div>';
    (document.body || document.documentElement).appendChild(modalEl);
    modalEl.addEventListener('click', function (e) {
      if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-gsbm-close')) hideModal();
    });
    return modalEl;
  }

  function showModal() {
    ensureModal();
    modalEl.classList.add('gsbm-open');
    if (document.body) document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    if (!modalEl) return;
    modalEl.classList.remove('gsbm-open');
    if (document.body) document.body.style.overflow = '';
  }

  // Capture-фаза: перехватываем клики по ссылкам брони раньше обработчиков страниц
  // (consent-modal в index/accommodation, двухшаговая форма пакетов, кнопки палаток).
  var widgetBase = String(C.widgetUrl || '').replace(/\/+$/, '');

  function isBookingTarget(el) {
    if (!el || !el.hasAttribute) return false;
    if (el.hasAttribute('data-booking-widget-link')) return true;
    if (el.getAttribute('data-config') === 'widget') return true;
    if (el.hasAttribute('data-package-book-step')) return true;
    if (el.classList && el.classList.contains('tent-book-btn')) return true;
    if (widgetBase) {
      var href = el.getAttribute('href') || '';
      if (href && href.indexOf(widgetBase) === 0) return true;
    }
    return false;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    var el = e.target && e.target.closest
      ? e.target.closest('a[data-booking-widget-link], a[data-config="widget"], [data-package-book-step], .tent-book-btn, a[href]')
      : null;
    if (!isBookingTarget(el)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    showModal();
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalEl && modalEl.classList.contains('gsbm-open')) hideModal();
  });
})();
