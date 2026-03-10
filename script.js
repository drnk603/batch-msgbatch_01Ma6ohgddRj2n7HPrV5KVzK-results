(function (global) {
  'use strict';

  global.__app = global.__app || {};
  var __app = global.__app;

  function debounce(fn, delay) {
    var timer;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, delay);
    };
  }

  function getHeaderHeight() {
    var header = document.querySelector('.l-header');
    return header ? header.getBoundingClientRect().height : 68;
  }

  function initBurger() {
    if (__app.burgerReady) return;
    __app.burgerReady = true;

    var toggle = document.querySelector('.navbar-toggler.c-nav__toggle');
    if (!toggle) return;

    var header = document.querySelector('.l-header');
    var navCollapse = document.querySelector('#mainNav');

    if (!navCollapse) return;

    var mobileMenu = document.createElement('nav');
    mobileMenu.id = 'mobile-menu';
    mobileMenu.setAttribute('aria-label', 'Mobile navigation');
    mobileMenu.setAttribute('role', 'navigation');

    var sourceLinks = header ? header.querySelectorAll('.nav-link.c-nav__item') : [];
    var ul = document.createElement('ul');
    ul.className = 'c-mobile-nav__list';

    for (var i = 0; i < sourceLinks.length; i++) {
      var li = document.createElement('li');
      li.className = 'c-mobile-nav__item';
      var cloned = sourceLinks[i].cloneNode(true);
      cloned.className = 'c-mobile-nav__link';
      if (sourceLinks[i].classList.contains('is-active')) {
        cloned.classList.add('is-active');
      }
      if (sourceLinks[i].getAttribute('aria-current')) {
        cloned.setAttribute('aria-current', sourceLinks[i].getAttribute('aria-current'));
      }
      li.appendChild(cloned);
      ul.appendChild(li);
    }

    mobileMenu.appendChild(ul);
    mobileMenu.classList.add('c-mobile-menu');

    document.body.appendChild(mobileMenu);

    function isOpen() {
      return mobileMenu.classList.contains('is-open');
    }

    function openMenu() {
      mobileMenu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      mobileMenu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    var mobileLinks = mobileMenu.querySelectorAll('.c-mobile-nav__link');
    for (var j = 0; j < mobileLinks.length; j++) {
      mobileLinks[j].addEventListener('click', function () {
        closeMenu();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (!mobileMenu.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var onResize = debounce(function () {
      if (global.innerWidth >= 768 && isOpen()) {
        closeMenu();
      }
    }, 150);

    global.addEventListener('resize', onResize, { passive: true });
  }

  function initScrollSpy() {
    if (__app.scrollSpyReady) return;
    __app.scrollSpyReady = true;

    var navLinks = document.querySelectorAll('.nav-link.c-nav__item[href^="#"], .c-mobile-nav__link[href^="#"]');
    if (!navLinks.length) return;

    var sections = [];
    for (var i = 0; i < navLinks.length; i++) {
      var href = navLinks[i].getAttribute('href');
      if (href && href !== '#' && href !== '#!') {
        var section = document.querySelector(href);
        if (section && sections.indexOf(section) === -1) {
          sections.push(section);
        }
      }
    }

    if (!sections.length) return;

    function onScroll() {
      var scrollY = global.pageYOffset;
      var headerH = getHeaderHeight();
      var current = '';

      for (var i = 0; i < sections.length; i++) {
        var top = sections[i].getBoundingClientRect().top + scrollY - headerH - 10;
        if (scrollY >= top) {
          current = '#' + sections[i].id;
        }
      }

      for (var j = 0; j < navLinks.length; j++) {
        var linkHref = navLinks[j].getAttribute('href');
        navLinks[j].classList.remove('is-active');
        navLinks[j].removeAttribute('aria-current');
        if (linkHref === current) {
          navLinks[j].classList.add('is-active');
          navLinks[j].setAttribute('aria-current', 'page');
        }
      }
    }

    global.addEventListener('scroll', debounce(onScroll, 80), { passive: true });
    onScroll();
  }

  function initAnchors() {
    if (__app.anchorsReady) return;
    __app.anchorsReady = true;

    var pathname = global.location.pathname;
    var isHome = pathname === '/' ||
      pathname === '/index.html' ||
      pathname.replace(//+$/, '') === '';

    var anchors = document.querySelectorAll('a[href^="#"]');

    for (var i = 0; i < anchors.length; i++) {
      (function (anchor) {
        var href = anchor.getAttribute('href');
        if (href === '#' || href === '#!') return;

        if (!isHome) {
          anchor.setAttribute('href', '/' + href);
          return;
        }

        anchor.addEventListener('click', function (e) {
          var target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();

          var offset = getHeaderHeight();
          var top = target.getBoundingClientRect().top + global.pageYOffset - offset;
          global.scrollTo({ top: top, behavior: 'smooth' });

          if (history.pushState) {
            history.pushState(null, null, href);
          }
        });
      })(anchors[i]);
    }
  }

  function initActiveMenu() {
    if (__app.activeMenuReady) return;
    __app.activeMenuReady = true;

    var links = document.querySelectorAll('.nav-link.c-nav__item, .c-mobile-nav__link');
    var pathname = global.location.pathname;

    function normPath(p) {
      return p.replace(//index.html$/, '/').replace(//$/, '') || '/';
    }

    var currentPath = normPath(pathname);

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var linkHref = link.getAttribute('href') || '';
      if (linkHref.indexOf('#') === 0) continue;
      var linkPath = normPath(linkHref.split('#')[0] || '/');

      link.removeAttribute('aria-current');
      link.classList.remove('is-active');

      if (linkPath === currentPath) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active');
      }
    }
  }

  function initScrollToTop() {
    if (__app.scrollToTopReady) return;
    __app.scrollToTopReady = true;

    var btn = document.querySelector('.c-scroll-top, .js-scroll-top, [data-scroll-top]');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'c-scroll-top';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.setAttribute('type', 'button');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>';
      document.body.appendChild(btn);
    }

    function checkVisibility() {
      if (global.pageYOffset > 400) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }

    btn.addEventListener('click', function () {
      global.scrollTo({ top: 0, behavior: 'smooth' });
    });

    global.addEventListener('scroll', debounce(checkVisibility, 100), { passive: true });
    checkVisibility();
  }

  function initCountUp() {
    if (__app.countUpReady) return;
    __app.countUpReady = true;

    var counters = document.querySelectorAll('[data-count-up], .c-stat__number, .js-countup');
    if (!counters.length) return;

    var started = [];

    function animateCounter(el) {
      var raw = el.getAttribute('data-target') || el.textContent;
      var suffix = '';
      var prefix = '';

      var match = raw.match(/^([^0-9]*)([0-9,]+)([^0-9]*)$/);
      if (!match) return;

      prefix = match[1] || '';
      var numStr = match[2].replace(/,/g, '');
      suffix = match[3] || '';
      var target = parseInt(numStr, 10);
      if (isNaN(target)) return;

      var duration = 1800;
      var start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(ease * target);
        el.textContent = prefix + current.toLocaleString() + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target.toLocaleString() + suffix;
        }
      }

      requestAnimationFrame(step);
    }

    for (var i = 0; i < counters.length; i++) {
      (function (el) {
        if (started.indexOf(el) !== -1) return;
        started.push(el);
        var original = el.textContent.trim();
        if (!el.getAttribute('data-target')) {
          el.setAttribute('data-target', original);
        }
        animateCounter(el);
      })(counters[i]);
    }
  }

  function createToastContainer() {
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      container.setAttribute('role', 'status');
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(container);
    }
    return container;
  }

  function notify(message, type) {
    var container = createToastContainer();
    type = type || 'info';
    var bgMap = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      warning: 'bg-warning text-dark',
      info: 'bg-info text-dark'
    };
    var bgClass = bgMap[type] || 'bg-secondary text-white';

    var toast = document.createElement('div');
    toast.className = 'toast show align-items-center border-0 mb-2 ' + bgClass;
    toast.setAttribute('role', 'alert');
    toast.innerHTML =
      '<div class="d-flex">' +
      '<div class="toast-body">' + message + '</div>' +
      '<button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>' +
      '</div>';

    var closeBtn = toast.querySelector('.btn-close');
    closeBtn.addEventListener('click', function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    });

    container.appendChild(toast);

    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
  }

  __app.notify = notify;

  function showFieldError(fieldEl, message, errorId) {
    fieldEl.classList.add('is-invalid');
    fieldEl.classList.remove('is-valid');
    var errorEl = errorId ? document.getElementById(errorId) : null;
    if (!errorEl) {
      errorEl = fieldEl.parentNode ? fieldEl.parentNode.querySelector('.c-form__error, .invalid-feedback') : null;
    }
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'invalid-feedback c-form__error';
      fieldEl.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  function clearFieldError(fieldEl) {
    fieldEl.classList.remove('is-invalid');
    var parent = fieldEl.parentNode;
    if (parent) {
      var errorEl = parent.querySelector('.c-form__error, .invalid-feedback');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    }
  }

  function validateEmail(value) {
    return /^[^s@]+@[^s@]+.[^s@]+$/.test(value);
  }

  function validatePhone(value) {
    return /^[-ds+()]{7,20}$/.test(value);
  }

  function blockHoneypot(form) {
    var hp = form.querySelector('[name="_honeypot"], [name="website"], .js-honeypot');
    if (hp && hp.value) return true;
    var timestamp = form.getAttribute('data-init-time');
    if (timestamp && (Date.now() - parseInt(timestamp, 10)) < 1500) return true;
    return false;
  }

  function setSubmitting(btn, originalHTML) {
    btn.disabled = true;
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending…';
    return originalHTML;
  }

  function resetSubmit(btn, originalHTML) {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }

  function validateNewsletterForm(form) {
    var valid = true;

    var nameEl = form.querySelector('#nl-name');
    var emailEl = form.querySelector('#nl-email');
    var consentEl = form.querySelector('#nl-consent');

    if (nameEl) clearFieldError(nameEl);
    if (emailEl) clearFieldError(emailEl);
    if (consentEl) clearFieldError(consentEl);

    if (nameEl && nameEl.value.trim() === '') {
      showFieldError(nameEl, 'Please enter your name.');
      valid = false;
    } else if (nameEl) {
      nameEl.classList.add('is-valid');
    }

    if (emailEl && !validateEmail(emailEl.value.trim())) {
      showFieldError(emailEl, 'Please enter a valid email address.');
      valid = false;
    } else if (emailEl) {
      emailEl.classList.add('is-valid');
    }

    if (consentEl && !consentEl.checked) {
      showFieldError(consentEl, 'You must agree to the terms to subscribe.');
      valid = false;
    }

    return valid;
  }

  function validateContactForm(form) {
    var valid = true;

    var fields = {
      contactFirstName: { required: true, label: 'First name', errorId: 'firstNameError' },
      contactLastName: { required: true, label: 'Last name', errorId: 'lastNameError' },
      contactEmail: { required: true, label: 'Email', errorId: 'emailError', type: 'email' },
      contactPhone: { required: false, label: 'Phone', errorId: 'phoneHint', type: 'phone' },
      contactSubject: { required: true, label: 'Subject', errorId: 'subjectError' },
      contactMessage: { required: true, label: 'Message', errorId: 'messageError', minLength: 10 },
      contactConsent: { required: true, label: 'Consent', errorId: 'consentError', type: 'checkbox' }
    };

    for (var id in fields) {
      var config = fields[id];
      var el = form.querySelector('#' + id);
      if (!el) continue;
      clearFieldError(el);

      if (config.type === 'checkbox') {
        if (config.required && !el.checked) {
          showFieldError(el, 'You must agree to the privacy policy.', config.errorId);
          valid = false;
        }
        continue;
      }

      var val = el.value.trim();

      if (config.required && val === '') {
        showFieldError(el, config.label + ' is required.', config.errorId);
        if (valid) el.focus();
        valid = false;
        continue;
      }

      if (!config.required && val === '') continue;

      if (config.type === 'email' && !validateEmail(val)) {
        showFieldError(el, 'Please enter a valid email address.', config.errorId);
        if (valid) el.focus();
        valid = false;
        continue;
      }

      if (config.type === 'phone' && val !== '' && !validatePhone(val)) {
        showFieldError(el, 'Please enter a valid phone number (7–20 digits).', config.errorId);
        if (valid) el.focus();
        valid = false;
        continue;
      }

      if (config.minLength && val.length < config.minLength) {
        showFieldError(el, config.label + ' must be at least ' + config.minLength + ' characters.', config.errorId);
        if (valid) el.focus();
        valid = false;
        continue;
      }

      el.classList.add('is-valid');
    }

    return valid;
  }

  function validateCallbackForm(form) {
    var valid = true;

    var nameEl = form.querySelector('#callbackName');
    var phoneEl = form.querySelector('#callbackPhone');
    var consentEl = form.querySelector('#callbackConsent');

    if (nameEl) clearFieldError(nameEl);
    if (phoneEl) clearFieldError(phoneEl);
    if (consentEl) clearFieldError(consentEl);

    if (nameEl && nameEl.value.trim() === '') {
      showFieldError(nameEl, 'Please enter your name.', 'callbackNameError');
      valid = false;
    } else if (nameEl) {
      nameEl.classList.add('is-valid');
    }

    if (phoneEl && phoneEl.value.trim() === '') {
      showFieldError(phoneEl, 'Phone number is required.', 'callbackPhoneError');
      valid = false;
    } else if (phoneEl && !validatePhone(phoneEl.value.trim())) {
      showFieldError(phoneEl, 'Please enter a valid phone number.', 'callbackPhoneError');
      valid = false;
    } else if (phoneEl) {
      phoneEl.classList.add('is-valid');
    }

    if (consentEl && !consentEl.checked) {
      showFieldError(consentEl, 'You must agree to the privacy policy.', 'callbackConsentError');
      valid = false;
    }

    return valid;
  }

  function validateGdprForm(form) {
    var valid = true;

    var nameEl = form.querySelector('#gdprName');
    var emailEl = form.querySelector('#gdprEmail');
    var rightTypeEl = form.querySelector('#gdprRightType');
    var messageEl = form.querySelector('#gdprMessage');
    var consentEl = form.querySelector('#gdprConsent');

    if (nameEl) clearFieldError(nameEl);
    if (emailEl) clearFieldError(emailEl);
    if (rightTypeEl) clearFieldError(rightTypeEl);
    if (messageEl) clearFieldError(messageEl);
    if (consentEl) clearFieldError(consentEl);

    if (nameEl && nameEl.value.trim() === '') {
      showFieldError(nameEl, 'Full name is required.');
      if (valid) nameEl.focus();
      valid = false;
    } else if (nameEl) {
      nameEl.classList.add('is-valid');
    }

    if (emailEl && !validateEmail(emailEl.value.trim())) {
      showFieldError(emailEl, 'Please enter a valid email address.');
      if (valid) emailEl.focus();
      valid = false;
    } else if (emailEl) {
      emailEl.classList.add('is-valid');
    }

    if (rightTypeEl && (!rightTypeEl.value || rightTypeEl.value === '')) {
      showFieldError(rightTypeEl, 'Please select a request type.');
      if (valid) rightTypeEl.focus();
      valid = false;
    } else if (rightTypeEl) {
      rightTypeEl.classList.add('is-valid');
    }

    if (messageEl && messageEl.value.trim().length < 10) {
      showFieldError(messageEl, 'Please provide a description (at least 10 characters).');
      if (valid) messageEl.focus();
      valid = false;
    } else if (messageEl) {
      messageEl.classList.add('is-valid');
    }

    if (consentEl && !consentEl.checked) {
      showFieldError(consentEl, 'You must agree to the data processing terms.');
      valid = false;
    }

    return valid;
  }

  function getFormValidator(form) {
    var id = form.id || '';
    if (id === 'newsletter-form') return validateNewsletterForm;
    if (id === 'contactForm') return validateContactForm;
    if (id === 'callbackForm') return validateCallbackForm;
    if (id === 'gdprForm') return validateGdprForm;
    return null;
  }

  function submitForm(form, btn, originalHTML) {
    var formData = {};
    var elements = form.elements;
    for (var j = 0; j < elements.length; j++) {
      var el = elements[j];
      if (el.name && el.type !== 'submit') {
        if (el.type === 'checkbox') {
          formData[el.name] = el.checked;
        } else {
          formData[el.name] = el.value;
        }
      }
    }

    if (!global.navigator.onLine) {
      notify('Connection error, please try again later.', 'error');
      resetSubmit(btn, originalHTML);
      return;
    }

    fetch('process.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(function (res) {
        if (res.ok) {
          global.location.href = 'thank_you.html';
        } else {
          throw new Error('Server error: ' + res.status);
        }
      })
      .catch(function (err) {
        if (!global.navigator.onLine) {
          notify('Connection error, please try again later.', 'error');
        } else {
          notify('Something went wrong. Please try again later.', 'error');
        }
        resetSubmit(btn, originalHTML);
      });
  }

  function initForms() {
    if (__app.formsReady) return;
    __app.formsReady = true;

    createToastContainer();

    var formIds = ['newsletter-form', 'contactForm', 'callbackForm', 'gdprForm'];

    for (var i = 0; i < formIds.length; i++) {
      (function (formId) {
        var form = document.getElementById(formId);
        if (!form) return;

        form.setAttribute('data-init-time', Date.now().toString());
        form.setAttribute('novalidate', '');

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          e.stopPropagation();

          if (blockHoneypot(form)) return;

          var validator = getFormValidator(form);
          if (validator && !validator(form)) {
            return;
          }

          var btn = form.querySelector('[type="submit"]');
          var originalHTML = btn ? btn.innerHTML : '';

          if (btn) setSubmitting(btn, originalHTML);

          submitForm(form, btn, originalHTML);
        });
      })(formIds[i]);
    }
  }

  function initPrivacyModal() {
    if (__app.privacyModalReady) return;
    __app.privacyModalReady = true;

    var triggers = document.querySelectorAll('[data-modal="privacy"], .js-privacy-trigger');
    if (!triggers.length) {
      var allLinks = document.querySelectorAll('a.c-link');
      for (var k = 0; k < allLinks.length; k++) {
        var text = allLinks[k].textContent.trim().toLowerCase();
        if (text.indexOf('privacy policy') !== -1 || text.indexOf('privacy') !== -1) {
          if (!allLinks[k].getAttribute('href') || allLinks[k].getAttribute('href') === '#') {
            allLinks[k].setAttribute('data-modal', 'privacy');
          }
        }
      }
      triggers = document.querySelectorAll('[data-modal="privacy"]');
    }

    if (!triggers.length) return;

    var existingModal = document.getElementById('privacy-modal');
    if (existingModal) return;

    var overlay = document.createElement('div');
    overlay.id = 'privacy-modal-overlay';
    overlay.className = 'c-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var modal = document.createElement('div');
    modal.id = 'privacy-modal';
    modal.className = 'c-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'privacy-modal-title');

    modal.innerHTML =
      '<div class="c-modal__header">' +
      '<h2 class="c-modal__title" id="privacy-modal-title">Privacy Policy</h2>' +
      '<button type="button" class="c-modal__close" aria-label="Close privacy policy">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
      '</button>' +
      '</div>' +
      '<div class="c-modal__body">' +
      '<p>Your privacy is important to us. By using our services, you agree to the collection and use of information in accordance with our policy. We collect only the information necessary to provide our services and do not share your personal data with third parties without your consent. For the full privacy policy, please visit our <a href="privacy.html" class="c-link">Privacy Policy page</a>.</p>' +
      '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function openModal() {
      overlay.classList.add('is-active');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('u-no-scroll');
      var closeBtn = modal.querySelector('.c-modal__close');
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('u-no-scroll');
    }

    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }

    var closeBtn = modal.querySelector('.c-modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('is-active')) return;
      if (e.key === 'Escape' || e.keyCode === 27) closeModal();
    });
  }

  function initVideoPlay() {
    if (__app.videoPlayReady) return;
    __app.videoPlayReady = true;

    var playBtns = document.querySelectorAll('.c-video-play');
    for (var i = 0; i < playBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var wrapper = btn.closest('[data-video-wrap], .c-video-wrap, .ratio');
          if (!wrapper) return;
          var video = wrapper.querySelector('video');
          var iframe = wrapper.querySelector('iframe');
          if (video) {
            video.play();
            btn.classList.add('is-hidden');
          } else if (iframe) {
            var src = iframe.getAttribute('src') || '';
            if (src.indexOf('autoplay') === -1) {
              iframe.setAttribute('src', src + (src.indexOf('?') !== -1 ? '&' : '?') + 'autoplay=1');
            }
            btn.classList.add('is-hidden');
          }
        });
      })(playBtns[i]);
    }
  }

  function initRipple() {
    if (__app.rippleReady) return;
    __app.rippleReady = true;

    var rippleTargets = document.querySelectorAll('.c-button, .btn');

    for (var i = 0; i < rippleTargets.length; i++) {
      (function (el) {
        el.addEventListener('click', function (e) {
          var existing = el.querySelector('.c-ripple');
          if (existing) existing.parentNode.removeChild(existing);

          var ripple = document.createElement('span');
          ripple.className = 'c-ripple';

          var rect = el.getBoundingClientRect();
          var size = Math.max(rect.width, rect.height);
          var x = e.clientX - rect.left - size / 2;
          var y = e.clientY - rect.top - size / 2;

          ripple.setAttribute('data-size', size);
          ripple.setAttribute('data-x', x);
          ripple.setAttribute('data-y', y);

          el.appendChild(ripple);

          setTimeout(function () {
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
          }, 600);
        });
      })(rippleTargets[i]);
    }
  }

  function initPassiveScroll() {
    if (__app.passiveScrollReady) return;
    __app.passiveScrollReady = true;

    global.addEventListener('scroll', function () {}, { passive: true });
    global.addEventListener('touchstart', function () {}, { passive: true });
    global.addEventListener('touchmove', function () {}, { passive: true });
  }

  function initCountdown() {
    if (__app.countdownReady) return;
    __app.countdownReady = true;

    var timer = document.querySelector('.c-countdown__timer');
    if (!timer) return;

    var endAttr = timer.getAttribute('data-end') || timer.getAttribute('data-countdown-end');
    if (!endAttr) {
      var future = new Date();
      future.setDate(future.getDate() + 3);
      endAttr = future.toISOString();
    }

    var endDate = new Date(endAttr);

    var daysEl = timer.querySelector('[data-countdown="days"] .c-countdown__value, .c-countdown__days');
    var hoursEl = timer.querySelector('[data-countdown="hours"] .c-countdown__value, .c-countdown__hours');
    var minsEl = timer.querySelector('[data-countdown="minutes"] .c-countdown__value, .c-countdown__minutes');
    var secsEl = timer.querySelector('[data-countdown="seconds"] .c-countdown__value, .c-countdown__seconds');

    if (!daysEl && !hoursEl && !minsEl && !secsEl) return;

    function pad(n) {
      return n < 10 ? '0' + n : '' + n;
    }

    function tick() {
      var now = new Date();
      var diff = endDate - now;
      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        return;
      }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);
      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minsEl) minsEl.textContent = pad(mins);
      if (secsEl) secsEl.textContent = pad(secs);
    }

    tick();
    setInterval(tick, 1000);
  }

  function initImages() {
    if (__app.imagesReady) return;
    __app.imagesReady = true;

    var svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 200 200%22%3E%3Crect width%3D%22200%22 height%3D%22200%22 fill%3D%22%23e9ecef%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-family%3D%22sans-serif%22 font-size%3D%2214%22 fill%3D%22%236c757d%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';

    var images = document.querySelectorAll('img');
    for (var i = 0; i < images.length; i++) {
      (function (img) {
        img.addEventListener('error', function () {
          if (img.src === svgPlaceholder) return;
          img.src = svgPlaceholder;
        });
      })(images[i]);
    }
  }

  __app.init = function () {
    initBurger();
    initAnchors();
    initActiveMenu();
    initScrollSpy();
    initScrollToTop();
    initCountUp();
    initForms();
    initPrivacyModal();
    initVideoPlay();
    initRipple();
    initPassiveScroll();
    initCountdown();
    initImages();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __app.init);
  } else {
    __app.init();
  }

}(window));
