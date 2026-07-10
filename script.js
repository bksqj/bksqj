/* ============================================================
   ДентаЛюкс — landing interactivity
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Optional: Telegram Bot integration ----------
     To send quiz/appointment leads to a Telegram bot, fill these in.
     Leave empty to run in demo mode (logs to console, shows success). */
  var TELEGRAM = {
    botToken: '',   // e.g. '123456:ABC-DEF...'
    chatId: ''      // e.g. '-1001234567890' or your user id
  };

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* Brand name is taken from <body data-brand="..."> so the same script
     serves multiple landings (dental, auto, ...). */
  var BRAND = document.body.getAttribute('data-brand') || 'ДентаЛюкс';

  /* ============================================================
     Sticky header state
     ============================================================ */
  var header = $('#header');
  var onScroll = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     Fullscreen menu overlay (toggled by the accent "Меню" pill)
     ============================================================ */
  var burger = $('#burger');
  var menuOverlay = $('#menuOverlay');
  var toggleMenu = function (open) {
    var isOpen = open != null ? open : menuOverlay.hasAttribute('hidden');
    menuOverlay.hidden = !isOpen;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.textContent = isOpen ? 'Закрыть' : 'Меню';
  };
  burger.addEventListener('click', function () { toggleMenu(); });
  $$('#menuOverlay a, #menuOverlay [data-open-modal]').forEach(function (a) {
    a.addEventListener('click', function () { toggleMenu(false); });
  });

  /* ============================================================
     Scroll reveal (Intersection Observer)
     ============================================================ */
  var revealEls = $$('[data-reveal]');
  /* stagger siblings: each next revealed card in a group waits a bit longer */
  revealEls.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var sibs = Array.prototype.filter.call(parent.children, function (c) { return c.hasAttribute('data-reveal'); });
    var idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 80, 400) + 'ms';
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Staggered hero reveal on load */
  window.addEventListener('load', function () {
    $$('.hero [data-reveal]').forEach(function (el, i) {
      setTimeout(function () { el.classList.add('is-visible'); }, 120 + i * 110);
    });
  });

  /* ============================================================
     Animated counters
     ============================================================ */
  var runCounter = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500, start = null;
    var fmt = function (n) { return n >= 1000 ? n.toLocaleString('ru-RU') : String(n); };
    var tick = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.floor(eased * target)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target) + suffix;
    };
    requestAnimationFrame(tick);
  };
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ============================================================
     Services marquee — duplicate track for seamless loop
     ============================================================ */
  var track = $('.marquee__track');
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* ============================================================
     Scroll-driven tilted carousel (advantages) — the track slides
     horizontally as the page scrolls, with a smooth lerp follow
     ============================================================ */
  $$('[data-carousel]').forEach(function (wrap) {
    var ctrack = $('.carousel__track', wrap);
    if (!ctrack) return;
    var target = 0, current = 0, raf = null;

    var measure = function () {
      var rect = wrap.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh - rect.top) / (vh + rect.height);
      p = Math.max(0, Math.min(1, p));
      var dist = ctrack.scrollWidth - wrap.clientWidth;
      target = dist > 0 ? -dist * p : 0;
      if (!raf) raf = requestAnimationFrame(step);
    };
    var step = function () {
      current += (target - current) * 0.1;
      ctrack.style.transform = 'translate3d(' + current + 'px, 0, 0)';
      if (Math.abs(target - current) > 0.5) raf = requestAnimationFrame(step);
      else { current = target; raf = null; }
    };
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    measure();
  });

  /* ============================================================
     Configurator — toggle option chips, collapse panels, count
     ============================================================ */
  (function initConfig() {
    var opts = $$('.config__opt');
    if (!opts.length) return;
    var countEl = $('#configCount');
    var updateCount = function () {
      if (countEl) countEl.textContent = $$('.config__opt.is-on').length;
    };
    opts.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.classList.contains('is-on')));
      btn.addEventListener('click', function () {
        btn.classList.toggle('is-on');
        btn.setAttribute('aria-pressed', String(btn.classList.contains('is-on')));
        updateCount();
      });
    });
    $$('.config__plus').forEach(function (plus) {
      plus.addEventListener('click', function () {
        var panel = plus.closest('.config__panel');
        var closed = panel.classList.toggle('is-closed');
        plus.setAttribute('aria-expanded', String(!closed));
      });
    });
    updateCount();
  })();

  /* ============================================================
     Hero mouse parallax (fine pointers only)
     ============================================================ */
  (function initParallax() {
    var media = $('.hero__media');
    var scene = $('.hero__scene');
    if (!media || !scene || !window.matchMedia('(pointer: fine)').matches) return;
    media.addEventListener('mousemove', function (e) {
      var r = media.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      scene.style.transform = 'translate(' + (-x * 26) + 'px, ' + (-y * 18) + 'px)';
    });
    media.addEventListener('mouseleave', function () {
      scene.style.transform = '';
    });
  })();

  /* ============================================================
     FAQ accordion
     ============================================================ */
  $$('.faq__item').forEach(function (item) {
    var btn = $('.faq__q', item);
    var answer = $('.faq__a', item);
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      answer.style.maxHeight = open ? answer.scrollHeight + 'px' : '0';
    });
  });

  /* ============================================================
     Appointment modal
     ============================================================ */
  var modal = $('#modal');
  var lastFocus = null;
  var openModal = function () {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var f = $('#mName'); if (f) f.focus();
  };
  var closeModal = function () {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  $$('[data-open-modal]').forEach(function (b) { b.addEventListener('click', openModal); });
  $$('[data-close-modal]').forEach(function (b) { b.addEventListener('click', closeModal); });

  /* Privacy modal */
  var privacyModal = $('#privacyModal');
  var openPrivacy = function (e) { if (e) e.preventDefault(); privacyModal.hidden = false; document.body.style.overflow = 'hidden'; };
  var closePrivacy = function () { privacyModal.hidden = true; document.body.style.overflow = ''; };
  $$('[data-open-privacy]').forEach(function (b) { b.addEventListener('click', openPrivacy); });
  $$('[data-close-privacy]').forEach(function (b) { b.addEventListener('click', closePrivacy); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      if (!privacyModal.hidden) closePrivacy();
      if (!menuOverlay.hidden) toggleMenu(false);
    }
  });

  /* ---- open quiz helpers ---- */
  var scrollToQuiz = function (e) {
    if (e) e.preventDefault();
    var quiz = $('#quiz');
    if (quiz) quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  $$('[data-open-quiz]').forEach(function (b) { b.addEventListener('click', scrollToQuiz); });

  /* ============================================================
     Lead submission (Telegram Bot API or demo mode)
     ============================================================ */
  function sendLead(data) {
    var text = '📩 <b>Новая заявка — ' + BRAND + '</b>\n\n' +
      Object.keys(data).map(function (k) { return '<b>' + k + ':</b> ' + data[k]; }).join('\n');

    if (TELEGRAM.botToken && TELEGRAM.chatId) {
      return fetch('https://api.telegram.org/bot' + TELEGRAM.botToken + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM.chatId, text: text, parse_mode: 'HTML' })
      }).then(function (r) { return r.json(); });
    }
    /* Demo mode */
    console.log('[' + BRAND + '] Заявка (демо-режим):', data);
    return Promise.resolve({ ok: true, demo: true });
  }

  /* ============================================================
     Multi-step quiz
     ============================================================ */
  (function initQuiz() {
    var form = $('#quizForm');
    if (!form) return;

    var steps = $$('.quiz__step', form).filter(function (s) { return s.getAttribute('data-step') !== 'done'; });
    var successStep = $('.quiz__success', form);
    var bar = $('#quizBar');
    var backBtn = $('#quizBack');
    var nextBtn = $('#quizNext');
    var submitBtn = $('#quizSubmit');
    var counter = $('#quizCounter');
    var nav = $('#quizNav');
    var total = steps.length;
    var current = 0;

    function showStep(idx, back) {
      steps.forEach(function (s, i) {
        s.hidden = i !== idx;
        if (i === idx) {
          s.classList.remove('is-active', 'slide-back');
          void s.offsetWidth; /* reflow to restart animation */
          s.classList.add('is-active');
          if (back) s.classList.add('slide-back');
        }
      });
      current = idx;
      bar.style.width = ((idx + 1) / total * 100) + '%';
      counter.textContent = 'Шаг ' + (idx + 1) + ' из ' + total;
      backBtn.hidden = idx === 0;
      nextBtn.hidden = idx === total - 1;
      submitBtn.hidden = idx !== total - 1;
    }

    function showError(step, msg) {
      var el = $('[data-error]', step);
      if (el) el.textContent = msg || '';
    }

    function validateStep(idx) {
      var step = steps[idx];
      showError(step, '');
      var radios = $$('input[type="radio"]', step);
      if (radios.length) {
        var name = radios[0].name;
        var groups = {};
        radios.forEach(function (r) { groups[r.name] = groups[r.name] || $$('input[name="' + r.name + '"]', step); });
        // require each required radio group in the step
        var reqNames = {};
        radios.forEach(function (r) { if (r.required) reqNames[r.name] = true; });
        for (var n in reqNames) {
          if (!$('input[name="' + n + '"]:checked', step)) {
            showError(step, 'Пожалуйста, выберите вариант.');
            return false;
          }
        }
      }
      var inputs = $$('input[type="text"], input[type="tel"], input[type="email"]', step);
      for (var i = 0; i < inputs.length; i++) {
        var inp = inputs[i];
        if (inp.required && !inp.value.trim()) {
          inp.classList.add('is-invalid');
          inp.focus();
          showError(step, 'Заполните обязательные поля.');
          return false;
        }
        inp.classList.remove('is-invalid');
      }
      var contact = $('input[name="contact"]', step);
      if (contact && contact.value.trim()) {
        var v = contact.value.trim();
        var okTg = /^@?[a-zA-Z0-9_]{4,}$/.test(v);
        if (!(v.replace(/\D/g, '').length >= 6 || okTg)) {
          contact.classList.add('is-invalid');
          showError(step, 'Укажите корректный телефон или Telegram.');
          return false;
        }
      }
      var consent = $('input[name="consent"]', step);
      if (consent && !consent.checked) {
        showError(step, 'Необходимо согласие на обработку данных.');
        return false;
      }
      return true;
    }

    nextBtn.addEventListener('click', function () {
      if (validateStep(current)) showStep(current + 1, false);
    });
    backBtn.addEventListener('click', function () {
      showStep(current - 1, true);
    });

    /* auto-advance on option pick for radio-only steps 1 & 2 */
    $$('.quiz__options input[type="radio"]', form).forEach(function (r) {
      r.addEventListener('change', function () {
        setTimeout(function () {
          if (current < total - 1 && validateStep(current)) showStep(current + 1, false);
        }, 220);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(current)) return;

      var fd = new FormData(form);
      var labels = {
        service: 'Услуга', urgency: 'Срочность', name: 'Имя',
        contact: 'Контакт', channel: 'Способ связи'
      };
      var data = {};
      Object.keys(labels).forEach(function (k) {
        var val = fd.get(k);
        if (val) data[labels[k]] = val;
      });

      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем…';
      sendLead(data).then(function () {
        steps.forEach(function (s) { s.hidden = true; });
        successStep.hidden = false;
        nav.style.display = 'none';
        bar.style.width = '100%';
      }).catch(function () {
        showError(steps[current], 'Не удалось отправить. Попробуйте ещё раз или позвоните нам.');
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';
      });
    });

    /* restart */
    var restart = $('[data-quiz-restart]', form);
    if (restart) restart.addEventListener('click', function () {
      form.reset();
      successStep.hidden = true;
      nav.style.display = '';
      showStep(0, false);
    });

    showStep(0, false);
  })();

  /* ============================================================
     Appointment form (modal)
     ============================================================ */
  (function initAppointment() {
    var form = $('#appointmentForm');
    if (!form) return;
    var success = $('.modal__success', modal);
    var errEl = $('[data-error]', form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#mName'), contact = $('#mPhone'), consent = $('input[name="consent"]', form);
      errEl.textContent = '';
      [name, contact].forEach(function (i) { i.classList.remove('is-invalid'); });

      if (!name.value.trim()) { name.classList.add('is-invalid'); errEl.textContent = 'Укажите имя.'; name.focus(); return; }
      if (contact.value.replace(/\D/g, '').length < 6 && !/^@?[a-zA-Z0-9_]{4,}$/.test(contact.value.trim())) {
        contact.classList.add('is-invalid'); errEl.textContent = 'Укажите корректный телефон или Telegram.'; contact.focus(); return;
      }
      if (!consent.checked) { errEl.textContent = 'Необходимо согласие на обработку данных.'; return; }

      var btn = $('button[type="submit"]', form);
      btn.disabled = true; btn.textContent = 'Отправляем…';
      sendLead({ Имя: name.value.trim(), Контакт: contact.value.trim(), Источник: 'Кнопка «Записаться на приём»' })
        .then(function () { form.hidden = true; success.hidden = false; })
        .catch(function () { errEl.textContent = 'Не удалось отправить. Позвоните нам, пожалуйста.'; })
        .finally(function () { btn.disabled = false; btn.textContent = 'Отправить заявку'; });
    });
  })();

  /* ============================================================
     Cookie banner
     ============================================================ */
  (function initCookie() {
    var cookie = $('#cookie');
    var accept = $('#cookieAccept');
    if (!cookie) return;
    var KEY = 'cookie_ok_' + BRAND;
    var stored;
    try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
    if (!stored) {
      setTimeout(function () { cookie.hidden = false; }, 1200);
    }
    accept.addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      cookie.hidden = true;
    });
  })();

})();
