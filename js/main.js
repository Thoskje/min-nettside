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
  const firstTab = document.querySelector('.h1-tab');
  const firstTabContent = document.getElementById('h1-tab-1');
  if (firstTab && firstTabContent) {
    firstTab.classList.add('active');
    firstTabContent.classList.add('active');
    // Marker riktig CTA-knapp i første tab
    const btn = firstTabContent.querySelector('.chat-btn');
    if (btn) btn.classList.add('cta-active');
  }

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
      // Bytt aktiv tab-knapp
      document.querySelectorAll('.h1-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Finn valgt tab-index (1, 2, 3)
      const tabIndex = this.getAttribute('data-h1');
      // Bytt aktivt innhold
      document.querySelectorAll('.h1-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById('h1-tab-' + tabIndex).classList.add('active');

      // Fjern aktiv-klasse fra alle CTA-knapper
      document.querySelectorAll('.hero-knapper .cta-button').forEach(btn => btn.classList.remove('cta-active'));
      // Legg til aktiv-klasse på riktig CTA-knapp i valgt tab (kun for farge)
      const activeTabContent = document.getElementById('h1-tab-' + tabIndex);
      if (activeTabContent) {
        if (tabIndex === "1") {
          activeTabContent.querySelector('.chat-btn').classList.add('cta-active');
        } else if (tabIndex === "2") {
          activeTabContent.querySelector('.avtal-btn').classList.add('cta-active');
        } else if (tabIndex === "3") {
          activeTabContent.querySelector('.kurs-btn').classList.add('cta-active');
        }
      }
    });
  });
});

// Vis biloppslag-widget når CTA-knappen trykkes
document.getElementById('cta-knapp').addEventListener('click', function() {
  document.getElementById('biloppslag-widget').style.display = 'block';
  this.style.display = 'none';
});

// Hent bilinfo når bruker søker
document.getElementById('sok-bil').addEventListener('click', function() {
  const regnr = document.getElementById('regnr').value;
  fetch(`/api/bil?regnr=${regnr}`)
    .then(res => res.json())
    .then(data => {
      const merke = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke || '';
      const modell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0] || '';
      const arsmodell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.arsmodell || '';
      const drivstoff = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.drivstoff || '';
      const motortype = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.motortype || '';
      const regnrUpper = regnr.toUpperCase();

      document.getElementById('bilinfo').innerHTML = `
        <strong>Bilmerke:</strong> ${merke}<br>
        <strong>Bilmodell:</strong> ${modell}<br>
        <strong>Årsmodell:</strong> ${arsmodell}<br>
        <strong>Drivstoff:</strong> ${drivstoff}<br>
        <strong>Motortype:</strong> ${motortype}<br>
        <strong>Registreringsnummer:</strong> ${regnrUpper}<br>
      `;

      // Lagre bilnavn for evt. chat
      const bilnavn = `${merke} ${modell} ${arsmodell} ${drivstoff} ${motortype} (${regnrUpper})`;
      localStorage.setItem('bilnavn', bilnavn);

      // Vis godkjenn-knapp
      document.getElementById('godkjenn-bil').style.display = 'inline-block';
    });
});

// 3. Når bruker godkjenner biltype, vis Stripe-knapp
document.getElementById('godkjenn-bil').addEventListener('click', function() {
  document.querySelector('.stripe-btn').style.display = 'inline-block';
  this.style.display = 'none';
});

// 4. Stripe-knapp og chat-tilgang håndteres som før

