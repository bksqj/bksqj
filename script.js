/* ============================================================
   Дентариум — интерактив лендинга
   ============================================================ */
(function () {
  'use strict';

  /* -------- Год в футере -------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------- Sticky header при скролле -------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------- Мобильное меню -------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  function toggleMenu(open) {
    var isOpen = open !== undefined ? open : mobileMenu.hidden;
    mobileMenu.hidden = !isOpen;
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  }
  burger.addEventListener('click', function () { toggleMenu(); });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { toggleMenu(false); });
  });

  /* -------- Reveal on scroll (Intersection Observer) -------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-line');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* -------- Hero: поочерёдное появление строк -------- */
  var heroLines = document.querySelectorAll('.hero .reveal-line');
  heroLines.forEach(function (el, i) {
    setTimeout(function () { el.classList.add('visible'); }, 120 + i * 130);
  });

  /* -------- Счётчики -------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.floor(eased * target);
      el.textContent = val >= 1000 ? val.toLocaleString('ru-RU') : val;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000 ? target.toLocaleString('ru-RU') : target;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(animateCounter);
  }

  /* -------- FAQ аккордеон -------- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var answer = item.querySelector('.faq__a');
      var isOpen = item.classList.contains('open');
      // Закрыть остальные
      document.querySelectorAll('.faq__item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq__a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  /* -------- Универсальный контроллер модалок -------- */
  var lastFocused = null;
  function openModal(id) {
    lastFocused = document.activeElement;
    var m = document.getElementById(id);
    if (!m) return;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    var focusable = m.querySelector('input, button, [tabindex]');
    if (focusable) setTimeout(function () { focusable.focus(); }, 50);
  }
  function closeModal(m) {
    m.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
  function closeAllModals() {
    document.querySelectorAll('.modal').forEach(function (m) {
      if (!m.hidden) closeModal(m);
    });
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (b) {
    b.addEventListener('click', function () { toggleMenu(false); openModal('modal'); });
  });
  document.querySelectorAll('[data-open-quiz]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); toggleMenu(false); openModal('quizModal'); });
  });
  document.querySelectorAll('[data-open-privacy]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); openModal('privacyModal'); });
  });
  document.querySelectorAll('[data-close-modal]').forEach(function (b) {
    b.addEventListener('click', function () { closeModal(document.getElementById('modal')); });
  });
  document.querySelectorAll('[data-close-quiz]').forEach(function (b) {
    b.addEventListener('click', function () { closeModal(document.getElementById('quizModal')); });
  });
  document.querySelectorAll('[data-close-privacy]').forEach(function (b) {
    b.addEventListener('click', function () { closeModal(document.getElementById('privacyModal')); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllModals();
  });

  /* -------- Валидация формы записи -------- */
  var apptForm = document.getElementById('appointmentForm');
  function validateField(input) {
    var field = input.closest('.field');
    var valid = true;
    if (input.type === 'checkbox') valid = input.checked;
    else if (input.type === 'tel' || input.name === 'phone') valid = /[\d\+][\d\s\-\(\)]{6,}/.test(input.value.trim());
    else valid = input.value.trim().length >= 2;
    if (field) field.classList.toggle('invalid', !valid);
    return valid;
  }
  if (apptForm) {
    apptForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      apptForm.querySelectorAll('[required]').forEach(function (input) {
        if (!validateField(input)) ok = false;
      });
      if (!ok) return;
      var data = {
        name: apptForm.name.value.trim(),
        phone: apptForm.phone.value.trim()
      };
      submitLead('Запись на приём', data);
      apptForm.style.display = 'none';
      document.getElementById('appointmentSuccess').hidden = false;
    });
    apptForm.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field && field.classList.contains('invalid')) validateField(input);
      });
    });
  }

  /* -------- Многошаговый квиз -------- */
  var quizForm = document.getElementById('quizForm');
  if (quizForm) {
    var current = 1;
    var total = 4;
    var panes = quizForm.querySelectorAll('.quiz__pane');
    var barEl = document.getElementById('quizBar');
    var stepEl = document.getElementById('quizStep');
    var prevBtn = document.getElementById('quizPrev');
    var nextBtn = document.getElementById('quizNext');
    var submitBtn = document.getElementById('quizSubmit');

    function showStep(n) {
      panes.forEach(function (p) {
        p.hidden = parseInt(p.getAttribute('data-step'), 10) !== n;
      });
      barEl.style.width = (n / total * 100) + '%';
      stepEl.textContent = n;
      prevBtn.hidden = n === 1;
      nextBtn.hidden = n === total;
      submitBtn.hidden = n !== total;
      if (n === total) buildSummary();
    }

    function currentPane() {
      return quizForm.querySelector('.quiz__pane[data-step="' + current + '"]');
    }

    function validateStep() {
      var pane = currentPane();
      var ok = true;
      // radio-группы
      var radios = pane.querySelectorAll('input[type="radio"][required]');
      if (radios.length) {
        var name = radios[0].name;
        if (!quizForm.querySelector('input[name="' + name + '"]:checked')) ok = false;
      }
      // текстовые поля
      pane.querySelectorAll('input[type="text"][required], input[type="checkbox"][required]').forEach(function (input) {
        if (!validateField(input)) ok = false;
      });
      pane.classList.toggle('show-error', !ok);
      return ok;
    }

    function buildSummary() {
      var fd = new FormData(quizForm);
      var rows = [
        ['Услуга', fd.get('service') || '—'],
        ['Срочность', fd.get('urgency') || '—'],
        ['Способ связи', fd.get('channel') || '—'],
        ['Имя', fd.get('name') || '—'],
        ['Контакт', fd.get('contact') || '—']
      ];
      document.getElementById('quizSummary').innerHTML = rows.map(function (r) {
        return '<div><span>' + r[0] + '</span><span>' + escapeHtml(r[1]) + '</span></div>';
      }).join('');
    }

    nextBtn.addEventListener('click', function () {
      if (!validateStep()) return;
      if (current < total) { current++; showStep(current); }
    });
    prevBtn.addEventListener('click', function () {
      if (current > 1) { current--; showStep(current); }
    });

    quizForm.querySelectorAll('input[type="radio"]').forEach(function (r) {
      r.addEventListener('change', function () {
        currentPane().classList.remove('show-error');
      });
    });
    quizForm.querySelectorAll('input[type="text"], input[type="checkbox"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field && field.classList.contains('invalid')) validateField(input);
      });
    });

    quizForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep()) return;
      var fd = new FormData(quizForm);
      var data = {};
      fd.forEach(function (v, k) { data[k] = v; });
      submitLead('Заявка (квиз)', data);
      quizForm.style.display = 'none';
      document.querySelector('.quiz__progress').style.display = 'none';
      document.getElementById('quizSuccess').hidden = false;
    });

    showStep(1);
  }

  /* -------- Отправка заявки --------
     Демо-режим: выводим в консоль. Для реальной отправки
     в Telegram-бота раскомментируйте sendToTelegram ниже и
     впишите TOKEN и CHAT_ID.
  ---------------------------------- */
  function submitLead(type, data) {
    console.log('[Заявка] ' + type, data);
    // sendToTelegram(type, data);
  }

  /* eslint-disable no-unused-vars */
  function sendToTelegram(type, data) {
    var TOKEN = 'ВАШ_BOT_TOKEN';
    var CHAT_ID = 'ВАШ_CHAT_ID';
    var lines = ['🦷 <b>' + type + '</b>', ''];
    Object.keys(data).forEach(function (k) { lines.push(k + ': ' + data[k]); });
    fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: lines.join('\n'), parse_mode: 'HTML' })
    }).catch(function (err) { console.error('Ошибка отправки в Telegram:', err); });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* -------- Cookie-баннер -------- */
  var cookie = document.getElementById('cookie');
  var COOKIE_KEY = 'dentarium_cookie_ok';
  try {
    if (!localStorage.getItem(COOKIE_KEY)) {
      setTimeout(function () { cookie.hidden = false; }, 1200);
    }
  } catch (e) { cookie.hidden = false; }
  document.getElementById('cookieAccept').addEventListener('click', function () {
    cookie.hidden = true;
    try { localStorage.setItem(COOKIE_KEY, '1'); } catch (e) {}
  });

})();
