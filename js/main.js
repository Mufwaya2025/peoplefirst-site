/* Peoplefirst HR Consultancy — shared site script */
(function () {
  'use strict';

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- brand mark (five-dot logo) ---------- */
  var dotColors = ['var(--dot-strategy)', 'var(--dot-talent)', 'var(--dot-comp)', 'var(--dot-labor)', 'var(--dot-tech)'];
  function buildMark(el) {
    if (!el) return;
    var positions = [
      { t: '2%', l: '50%', s: 9 }, { t: '20%', l: '85%', s: 7 }, { t: '62%', l: '92%', s: 8 },
      { t: '85%', l: '55%', s: 9 }, { t: '70%', l: '12%', s: 7 }, { t: '25%', l: '8%', s: 8 }
    ];
    positions.forEach(function (p, i) {
      var d = document.createElement('span');
      d.style.top = p.t; d.style.left = p.l;
      d.style.width = p.s + 'px'; d.style.height = p.s + 'px';
      d.style.background = dotColors[i % dotColors.length];
      d.style.transform = 'translate(-50%,-50%)';
      el.appendChild(d);
    });
  }
  buildMark(document.getElementById('logoMark'));
  buildMark(document.getElementById('logoMarkFooter'));

  /* ---------- scroll reveal (created BEFORE anything observes) ---------- */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
  }
  function observeReveal(scope) {
    var els = (scope || document).querySelectorAll('.reveal');
    for (var i = 0; i < els.length; i++) {
      if (io) io.observe(els[i]); else els[i].classList.add('in');
    }
  }

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById('menuToggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'primaryNav');
    links.id = links.id || 'primaryNav';
    function setMenu(open) {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function (e) {
      if (links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });
  }

  /* ---------- home hero constellation ---------- */
  var nodeAngles = [-90, -18, 54, 126, 198];
  var constellation = document.getElementById('constellation');
  if (constellation) {
    var lineGroup = document.getElementById('linkLines');
    var labels = constellation.querySelectorAll('.node-label');
    function layoutConstellation() {
      var size = constellation.clientWidth;
      if (!size) return;
      var R = size * 0.37, center = size / 2, linesHTML = '';
      for (var i = 0; i < labels.length; i++) {
        var angle = nodeAngles[i] * Math.PI / 180;
        var x = center + R * Math.cos(angle);
        var y = center + R * Math.sin(angle);
        labels[i].style.left = (x / size * 100) + '%';
        labels[i].style.top = (y / size * 100) + '%';
        linesHTML += '<line x1="' + center + '" y1="' + center + '" x2="' + x + '" y2="' + y + '" />';
      }
      lineGroup.innerHTML = linesHTML;
    }
    window.addEventListener('resize', layoutConstellation);
    layoutConstellation();
  }

  /* ---------- service data (single source of truth) ---------- */
  var services = [
    {
      name: 'HR Strategy &amp; Planning', slug: 'strategy', color: 'var(--dot-strategy)',
      blurb: 'Align your people function with where the business is headed.',
      icon: '<path d="M3 3v18h18"/><path d="M18.7 8 12 14.7 8.5 11.2 3 16.7"/>',
      items: [
        'Develop and implement effective HR strategies aligned with business objectives.',
        'Conduct comprehensive HR audits and assessments.',
        'Design and optimize organizational structures and job roles.'
      ]
    },
    {
      name: 'Talent Acquisition &amp; Management', slug: 'talent', color: 'var(--dot-talent)',
      blurb: 'Find, grow, and keep the people who move the business forward.',
      icon: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/><path d="M17 11a4 4 0 1 0 0-8"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
      items: [
        'Implement robust recruitment and selection processes.',
        'Develop and execute talent management strategies.',
        'Provide performance management and coaching solutions.',
        'Offer employee training and development programs.'
      ]
    },
    {
      name: 'Compensation &amp; Benefits', slug: 'compensation', color: 'var(--dot-comp)',
      blurb: 'Pay and benefits that are fair, competitive, and compliant.',
      icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5-1.3 2-3 2.5-3 1.1-3 2.5 1.3 2.5 3 2.5 3-1.1 3-2.5"/>',
      items: [
        'Design competitive compensation and benefits packages.',
        'Conduct salary surveys and benchmarking analysis.',
        'Manage payroll and tax compliance.'
      ]
    },
    {
      name: 'Labor Relations &amp; Compliance', slug: 'labor', color: 'var(--dot-labor)',
      blurb: 'Stay compliant, and be ready when disputes come up.',
      icon: '<path d="M12 2 3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5Z"/><path d="m9 12 2 2 4-4"/>',
      items: [
        'Advise on labor law compliance and risk management.',
        'Represent clients in labor disputes and negotiations.',
        'Conduct workplace investigations and disciplinary actions.',
        'Provide guidance on employee relations and grievance handling.'
      ]
    },
    {
      name: 'HR Technology Solutions', slug: 'tech', color: 'var(--dot-tech)',
      blurb: 'Systems and data that make the rest of this run smoothly.',
      icon: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
      items: [
        'Implement and manage HR software and systems.',
        'Provide data analytics and reporting services.'
      ]
    }
  ];
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>';

  /* ---------- services page: tabs + panels ---------- */
  var tabRow = document.getElementById('tabRow');
  var panelRow = document.getElementById('panelRow');
  if (tabRow && panelRow) {
    function idxFromHash() {
      var slug = (location.hash || '').replace('#', '');
      var i = -1;
      for (var k = 0; k < services.length; k++) if (services[k].slug === slug) i = k;
      return i < 0 ? 0 : i;
    }
    var tabs = [], panels = [];
    services.forEach(function (s, i) {
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'tab-btn';
      tab.id = 'tab-' + s.slug;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'panel-' + s.slug);
      tab.innerHTML = '<i style="background:' + s.color + '"></i>' + s.name;
      tab.addEventListener('click', function () { selectTab(i, true); });
      tabRow.appendChild(tab);
      tabs.push(tab);

      var panel = document.createElement('div');
      panel.className = 'service-panel';
      panel.id = 'panel-' + s.slug;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.innerHTML =
        '<div class="service-panel-left">' +
          '<div class="service-dot-lg" style="background:' + s.color + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' + s.icon + '</svg>' +
          '</div>' +
          '<h3>' + s.name + '</h3>' +
          '<p>' + s.blurb + '</p>' +
        '</div>' +
        '<ul class="service-list">' +
          s.items.map(function (it) { return '<li>' + CHECK + it + '</li>'; }).join('') +
        '</ul>';
      panelRow.appendChild(panel);
      panels.push(panel);
    });

    function selectTab(idx, pushHash) {
      tabs.forEach(function (t, i) {
        var on = i === idx;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, i) { p.classList.toggle('active', i === idx); });
      if (pushHash && history.replaceState) history.replaceState(null, '', '#' + services[idx].slug);
    }
    tabRow.addEventListener('keydown', function (e) {
      var cur = tabs.indexOf(document.activeElement);
      if (cur < 0) return;
      var next = null;
      if (e.key === 'ArrowRight') next = (cur + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (cur - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) { e.preventDefault(); selectTab(next, true); tabs[next].focus(); }
    });
    window.addEventListener('hashchange', function () { selectTab(idxFromHash(), false); });
    selectTab(idxFromHash(), false);
  }

  /* ---------- home page: service preview grid ---------- */
  var previewGrid = document.getElementById('servicePreviewGrid');
  if (previewGrid) {
    previewGrid.innerHTML = services.map(function (s) {
      return '<a class="service-preview-card reveal" href="services.html#' + s.slug + '">' +
        '<div class="dot" style="background:' + s.color + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' + s.icon + '</svg>' +
        '</div>' +
        '<h4>' + s.name + '</h4>' +
        '<p>' + s.blurb + '</p>' +
      '</a>';
    }).join('');
  }

  /* ---------- contact form: posts to /api/contact, falls back to the visitor's mail client ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var note = document.getElementById('formNote');
    var submitBtn = form.querySelector('button[type="submit"]');
    var to = form.getAttribute('data-to') || 'info@peoplefirst.ink';
    var tsField = form.elements['ts'];
    if (tsField) tsField.value = String(Date.now());

    function f(n) { return (form.elements[n] && form.elements[n].value || '').trim(); }
    function showNote(html, kind) {
      if (!note) return;
      note.innerHTML = html;
      note.className = 'form-note show' + (kind ? ' ' + kind : '');
    }
    function mailtoFallback() {
      var subject = 'Enquiry: ' + (f('service') || 'General') + ' — ' + (f('company') || f('name'));
      var body = 'Name: ' + f('name') + '\nCompany: ' + (f('company') || '-') + '\nEmail: ' + f('email') +
        '\nPhone: ' + (f('phone') || '-') + '\nArea of interest: ' + (f('service') || 'Not sure yet') + '\n\n' + f('message') + '\n';
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      showNote('We couldn’t reach our server, so your email app should open with the message ready to send. Or email <a href="mailto:' + to + '"><strong>' + to + '</strong></a> / call <a href="tel:+260977648552"><strong>+260 977 648 552</strong></a>.', 'warn');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!window.fetch) { mailtoFallback(); return; }

      var payload = {};
      ['name', 'company', 'email', 'phone', 'service', 'message', 'website', 'ts'].forEach(function (k) { payload[k] = f(k); });
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        return r.json().then(function (data) { return { status: r.status, data: data }; });
      }).then(function (out) {
        if (out.status === 200 && out.data && out.data.ok) {
          form.reset();
          if (tsField) tsField.value = String(Date.now());
          showNote('<strong>Thanks, ' + (payload.name.split(' ')[0] || 'your message is in') + '.</strong> We’ve received your enquiry and will reply to ' + payload.email + ' within one working day.', 'ok');
        } else {
          showNote((out.data && out.data.error) || 'Something went wrong. Please try again or email <a href="mailto:' + to + '"><strong>' + to + '</strong></a>.', 'warn');
        }
      }).catch(function () {
        mailtoFallback();
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
      });
    });
  }

  /* ---------- floating WhatsApp button (all pages) ---------- */
  var WA_NUMBER = '260977648552';
  if (!document.querySelector('.wa-float')) {
    var wa = document.createElement('a');
    wa.className = 'wa-float';
    wa.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Hello Peoplefirst, I’d like to talk about HR support for my business.');
    wa.target = '_blank'; wa.rel = 'noopener';
    wa.setAttribute('aria-label', 'Chat with us on WhatsApp');
    wa.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m0 1.67c4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24c-1.5 0-2.96-.4-4.23-1.17l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.28-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01"/></svg><span>WhatsApp us</span>';
    document.body.appendChild(wa);
  }

  /* ---------- kick off reveal for everything (including injected cards) ---------- */
  observeReveal(document);
})();
