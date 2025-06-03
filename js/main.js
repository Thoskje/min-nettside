console.log("main.js lastet");

/* ===========================
   Accordion-funksjonalitet
   =========================== */
document.querySelectorAll('.accordion-header').forEach(function(header) {
  header.addEventListener('click', function() {
    const body = this.nextElementSibling;
    body.classList.toggle('active');
  });
});

/* ===========================
   Hero-faner: Bytte av innhold ved klikk
   =========================== */
document.addEventListener('DOMContentLoaded', function() {
  // H1-tabs (øverst i hero)
  const tabButtons = document.querySelectorAll('.h1-tab');
  tabButtons.forEach(function(tabBtn) {
    tabBtn.addEventListener('click', function() {
      // Fjern aktiv-klasse fra alle tabs og innhold
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.h1-tab-content').forEach(tab => tab.classList.remove('active'));

      // Legg til aktiv-klasse på valgt tab og innhold
      tabBtn.classList.add('active');
      const tabNum = tabBtn.getAttribute('data-h1');
      const tabContent = document.getElementById('h1-tab-' + tabNum);
      if (tabContent) tabContent.classList.add('active');

      // Fjern aktiv-klasse fra ALLE CTA-knapper
      document.querySelectorAll('.hero-knapper .cta-button').forEach(btn => btn.classList.remove('active'));

      // Legg til aktiv-klasse på riktig CTA-knapp i AKTIV tab
      let focusBtnId = '';
      if (tabNum === '1') focusBtnId = 'chat-btn';
      else if (tabNum === '2') focusBtnId = 'avtal-btn';
      else if (tabNum === '3') focusBtnId = 'kurs-btn';

      if (focusBtnId && tabContent) {
        const btn = tabContent.querySelector('#' + focusBtnId);
        if (btn) {
          btn.classList.add('active');
          btn.focus();
        }
      }
    });
  });

  // Aktiver første tab ved lasting
  const firstTab = document.querySelector('.h1-tab.active');
  if (firstTab) firstTab.click();

  // CTA-knapp: Kurs
  document.querySelectorAll('.hero-knapper .kurs-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      window.location.href = 'html/kurs.html';
    });
  });

  // Hero "mer info"-piler
  const heroIcon = document.getElementById('hero-more-icon');
  const heroMore = document.getElementById('hero-more-text');
  if (heroIcon && heroMore) {
    heroIcon.addEventListener('click', function() {
      const open = heroMore.style.display === 'inline';
      heroMore.style.display = open ? 'none' : 'inline';
      heroIcon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  }
  const avtalIcon = document.getElementById('avtal-more-icon');
  const avtalMore = document.getElementById('avtal-more-text');
  if (avtalIcon && avtalMore) {
    avtalIcon.addEventListener('click', function() {
      const open = avtalMore.style.display === 'inline';
      avtalMore.style.display = open ? 'none' : 'inline';
      avtalIcon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  }
  const kursIcon = document.getElementById('kurs-more-icon');
  const kursMore = document.getElementById('kurs-more-text');
  if (kursIcon && kursMore) {
    kursIcon.addEventListener('click', function() {
      const open = kursMore.style.display === 'inline';
      kursMore.style.display = open ? 'none' : 'inline';
      kursIcon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  }

  // Hamburger-meny
  const menuBtn = document.getElementById('menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
    // Lukk meny ved klikk på lenke
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.remove('open'));
    });
    // Lukk meny ved klikk utenfor
    document.addEventListener('click', function(e) {
      if (!mobileNav.contains(e.target) && e.target !== menuBtn) {
        mobileNav.classList.remove('open');
      }
    });
  }

  document.querySelectorAll('.h1-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.h1-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      // ...vis riktig tab-innhold...
    });
  });
});

