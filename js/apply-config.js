/**
 * Применяет window.CONFIG к странице: ссылки с data-config, онлайн-бронирование, PROKAT_DATA.
 * Подключать после js/config.js.
 */
(function() {
  'use strict';

  /**
   * Фото с сервера бронирований часто приходят как `/uploads/...` (относительный путь).
   * На статическом сайте иначе браузер ищет файл на домене страницы → 404.
   * Склеиваем с origin сервера: из `apiBaseUrl` убираем хвост `/api`.
   */
  window.resolveApiUploadUrl = function(url) {
    if (url == null || typeof url !== 'string') return url;
    var u = url.trim();
    if (!u) return u;
    if (/^https?:\/\//i.test(u)) return u;
    if (u.indexOf('/uploads/') !== 0) return u;
    var apiBase = (window.CONFIG && window.CONFIG.apiBaseUrl) || '';
    var origin = apiBase.replace(/\/+$/, '').replace(/\/api\/?$/, '');
    return origin ? origin + u : u;
  };

  /**
   * Собрать ссылку на онлайн-бронирование (period, objectId, даты) из data-* на ссылке.
   */
  function buildWidgetBookingHrefForLink(el, C) {
    // Консервация (bookingMode=placeholder): ссылки виджета не ведём наружу —
    // клик перехватывает js/booking-mode.js и показывает заглушку.
    if (window.GSBooking && !window.GSBooking.isLive()) return '#';
    if (!C || !C.widgetUrl) {
      var h = (el.getAttribute('href') || '').trim();
      return h && h !== '#' ? h : '#';
    }
    var url = (C.widgetUrl || '').replace(/\/+$/, '') + '/';
    var q = [];
    var period = el.getAttribute('data-widget-period');
    if (period === 'hourly' || period === 'daily') {
      q.push('period=' + encodeURIComponent(period));
    }
    var oid = (el.getAttribute('data-widget-object-id') || '').trim();
    if (oid) {
      q.push('objectId=' + encodeURIComponent(oid));
    }
    var ci = (el.getAttribute('data-widget-check-in') || '').trim();
    var co = (el.getAttribute('data-widget-check-out') || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(ci)) {
      q.push('checkIn=' + encodeURIComponent(ci));
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(co)) {
      q.push('checkOut=' + encodeURIComponent(co));
    }
    var typeMatch = (el.getAttribute('data-widget-type-match') || '').trim().toLowerCase();
    if (typeMatch === 'bania' || typeMatch === 'banya' || typeMatch === 'mangal' || typeMatch === 'bungalow') {
      q.push('typeMatch=' + encodeURIComponent(typeMatch === 'banya' ? 'bania' : typeMatch));
    }
    var pkgTpl = (el.getAttribute('data-widget-package-template-id') || '').trim();
    if (/^[0-9a-f-]{36}$/i.test(pkgTpl)) {
      q.push('packageTemplateId=' + encodeURIComponent(pkgTpl));
    }
    var initStep = (el.getAttribute('data-widget-initial-step') || '').trim().toLowerCase();
    if (initStep === 'contact' || initStep === 'extras') {
      q.push('initialStep=' + encodeURIComponent(initStep));
    }
    if (q.length) {
      url += (url.indexOf('?') >= 0 ? '&' : '?') + q.join('&');
    }
    return url;
  }

  window.refreshWidgetBookingHrefForLink = function(el) {
    return buildWidgetBookingHrefForLink(el, window.CONFIG);
  };

  var C = window.CONFIG;
  if (!C) return;

  /**
   * Безопасно ставит текст в элемент:
   * 1) Если внутри есть вложенный [data-config-text="1"] — заполняет его (не трогая иконки/обёртки).
   * 2) Иначе если сам элемент имеет data-config-text="1" — перезаписывает textContent целиком.
   * 3) Иначе, если textContent пустой — ставит текст.
   */
  function setConfigText(el, value) {
    if (!el || value == null) return;
    var inner = el.querySelector('[data-config-text="1"]');
    if (inner && inner !== el) {
      if ((inner.textContent || '').trim() === '') inner.textContent = value;
      return;
    }
    if (el.getAttribute('data-config-text') === '1') {
      el.textContent = value;
      return;
    }
    if (el.children.length === 0 && (el.textContent || '').trim() === '') {
      el.textContent = value;
    }
  }

  function apply() {
    var phoneRaw = (C.phone || '').replace(/\s/g, '');
    var phoneTentsRaw = (C.phoneTents || '').replace(/\s/g, '');

    document.querySelectorAll('[data-config="phone"]').forEach(function(el) {
      el.href = 'tel:' + phoneRaw;
      setConfigText(el, C.phoneFormatted || C.phone);
    });
    document.querySelectorAll('[data-config="phone-tents"]').forEach(function(el) {
      el.href = 'tel:' + phoneTentsRaw;
      setConfigText(el, C.phoneTentsFormatted || C.phoneTents);
    });
    document.querySelectorAll('[data-config="max"]').forEach(function(el) {
      el.href = C.maxUrl || '#';
      setConfigText(el, C.maxFormatted || C.phoneFormatted || C.max || C.phone);
    });
    document.querySelectorAll('[data-config="email"]').forEach(function(el) {
      el.href = 'mailto:' + (C.email || '');
      setConfigText(el, C.email);
    });
    document.querySelectorAll('[data-config="email-returns"]').forEach(function(el) {
      el.href = 'mailto:' + (C.emailReturns || C.email || '');
      setConfigText(el, C.emailReturns || C.email);
    });
    document.querySelectorAll('[data-config="telegram"]').forEach(function(el) {
      el.href = (C.telegramBot || '').replace(/\/+$/, '') + (el.getAttribute('data-tg-text') ? '?text=' + encodeURIComponent(el.getAttribute('data-tg-text')) : '');
      if (el.getAttribute('data-config-text') === '1' && !el.textContent.trim()) {
        el.textContent = '@' + (C.telegramBot || '').replace(/^.*\//, '').replace(/\/+$/, '');
      }
    });
    document.querySelectorAll('[data-config="telegram-channel"]').forEach(function(el) {
      el.href = C.telegramChannel || '';
    });
    document.querySelectorAll('[data-config="vk"]').forEach(function(el) {
      el.href = C.vkUrl || '';
    });
    document.querySelectorAll('[data-config="address"]').forEach(function(el) {
      if (el.textContent === '' || el.getAttribute('data-config-text') === '1') el.textContent = C.address || '';
    });
    document.querySelectorAll('[data-config="site-name"]').forEach(function(el) {
      if (el.textContent === '' || el.getAttribute('data-config-text') === '1') el.textContent = C.siteName || '';
    });
    document.querySelectorAll('[data-config="signature-email"]').forEach(function(el) {
      el.href = 'mailto:' + (C.signatureEmail || '');
    });
    document.querySelectorAll('[data-config="widget"]').forEach(function(el) {
      el.href = buildWidgetBookingHrefForLink(el, C);
    });
    document.querySelectorAll('[data-booking-widget-link]').forEach(function(el) {
      el.href = buildWidgetBookingHrefForLink(el, C);
    });

    window.API_BASE_URL = C.apiBaseUrl;
    window.WIDGET_URL = (C.widgetUrl || '').replace(/\/+$/, '') + '/';

    if (window.PROKAT_DATA && window.PROKAT_DATA.contacts) {
      window.PROKAT_DATA.contacts.phone = C.phoneFormatted || C.phone;
      window.PROKAT_DATA.contacts.phoneRaw = phoneRaw;
      window.PROKAT_DATA.contacts.phoneCamping = C.phoneTentsFormatted || C.phoneTents;
      window.PROKAT_DATA.contacts.phoneCampingRaw = phoneTentsRaw;
      window.PROKAT_DATA.contacts.telegram = C.telegramBot;
      window.PROKAT_DATA.contacts.max = C.maxUrl || '#';
      window.PROKAT_DATA.contacts.bookingWidget = window.WIDGET_URL;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      apply();
      setTimeout(apply, 1500);
    });
  } else {
    apply();
    setTimeout(apply, 1500);
  }
  window.applyConfig = apply;
})();

/**
 * Нативные поля дат заезда/выезда в форме бронирования (#contact-date, #contact-checkout).
 * Блоки могут появиться в DOM после fetch header/footer — подключаем через MutationObserver.
 * Safari на iOS: дублируем проверку min/max и слушаем input + change (как на promotions для пакетов).
 */
(function() {
  'use strict';

  var STYLE_ID = 'gs-contact-booking-date-styles';

  function injectStylesOnce() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      'input#contact-date[type="date"],\n' +
      'input#contact-checkout[type="date"] {\n' +
      '  max-width: 100%;\n' +
      '  min-width: 0;\n' +
      '  box-sizing: border-box;\n' +
      '}\n' +
      '#booking-form,\n' +
      'form#booking-form {\n' +
      '  min-width: 0;\n' +
      '  max-width: 100%;\n' +
      '}\n';
    (document.head || document.documentElement).appendChild(s);
  }

  function clipToMinMax(inp) {
    if (!inp || !inp.value) return false;
    var v = inp.value;
    var mn = inp.getAttribute('min');
    var mx = inp.getAttribute('max');
    if (mn && v < mn) {
      inp.value = '';
      return true;
    }
    if (mx && v > mx) {
      inp.value = '';
      return true;
    }
    if (inp.validity && (inp.validity.rangeUnderflow || inp.validity.rangeOverflow)) {
      inp.value = '';
      return true;
    }
    return false;
  }

  function bindContactBookingDates() {
    var ci = document.getElementById('contact-date');
    var co = document.getElementById('contact-checkout');
    if (!ci || !co) return;
    if (ci.getAttribute('data-gs-date-bound') === '1') return;
    if (ci.type !== 'date' || co.type !== 'date') return;

    ci.setAttribute('data-gs-date-bound', '1');
    co.setAttribute('data-gs-date-bound', '1');

    var today = new Date().toISOString().split('T')[0];
    if (!ci.getAttribute('min')) ci.setAttribute('min', today);

    function syncCheckoutMinFromCheckin() {
      if (!ci.value) {
        co.removeAttribute('min');
        return;
      }
      var parts = ci.value.split('-');
      if (parts.length !== 3) return;
      var y = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10) - 1;
      var d = parseInt(parts[2], 10);
      var selectedDate = new Date(y, m, d);
      if (isNaN(selectedDate.getTime())) return;
      selectedDate.setDate(selectedDate.getDate() + 1);
      var y2 = selectedDate.getFullYear();
      var m2 = String(selectedDate.getMonth() + 1).padStart(2, '0');
      var d2 = String(selectedDate.getDate()).padStart(2, '0');
      var minCheckout = y2 + '-' + m2 + '-' + d2;
      co.setAttribute('min', minCheckout);
      if (co.value && co.value < minCheckout) co.value = '';
    }

    function onDateFieldInput() {
      syncCheckoutMinFromCheckin();
      clipToMinMax(ci);
      syncCheckoutMinFromCheckin();
      clipToMinMax(co);
    }

    ci.addEventListener('change', onDateFieldInput);
    ci.addEventListener('input', onDateFieldInput);
    co.addEventListener('change', onDateFieldInput);
    co.addEventListener('input', onDateFieldInput);

    syncCheckoutMinFromCheckin();
  }

  function tick() {
    injectStylesOnce();
    bindContactBookingDates();
  }

  var mo = new MutationObserver(function() {
    tick();
  });

  if (document.documentElement) {
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  } else {
    tick();
  }
})();
