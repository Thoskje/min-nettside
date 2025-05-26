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
   CTA-knapper: Fargebytte ved hover
   =========================== */
function leggTilCTAEvent() {
  const avtalBtn = document.querySelector('.hero-knapper .avtal-btn');
  const chatBtn = document.querySelector('.hero-knapper .chat-btn');
  if (avtalBtn && chatBtn) {
    avtalBtn.addEventListener('mouseenter', () => {
      chatBtn.style.background = '#0c1a2a';
      avtalBtn.style.background = '#ff9900';
    });
    avtalBtn.addEventListener('mouseleave', () => {
      chatBtn.style.background = '#ff9900';
      avtalBtn.style.background = '#0c1a2a';
    });
  }
}

// Kjør første gang på sideinnlasting
leggTilCTAEvent();

/* ===========================
   Hero-faner: Bytte av innhold ved klikk
   =========================== */
document.querySelectorAll('.hero-tabs').forEach(tabBar => {
  tabBar.querySelectorAll('.hero-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      // Fjern aktiv klasse fra alle faner og innhold i hero
      tabBar.querySelectorAll('.hero-tab').forEach(b => b.classList.remove('active'));
      const hero = tabBar.closest('.hero');
      hero.querySelectorAll('.hero-tab-content').forEach(tc => tc.classList.remove('active'));
      // Legg til aktiv klasse på valgt fane og innhold
      this.classList.add('active');
      const tab = this.getAttribute('data-tab');
      const content = hero.querySelector('#hero-tab-' + tab);
      if (content) content.classList.add('active');
    });
  });
});

document.querySelectorAll('.h1-tabs').forEach(tabBar => {
  tabBar.querySelectorAll('.h1-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      // Fjern aktiv klasse fra alle h1-faner og innhold
      tabBar.querySelectorAll('.h1-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.h1-tab-content').forEach(tc => tc.classList.remove('active'));
      // Legg til aktiv klasse på valgt fane og innhold
      this.classList.add('active');
      const tab = this.getAttribute('data-h1');
      const content = document.getElementById('h1-tab-' + tab);
      if (content) content.classList.add('active');
      // Legg til event listeners på nytt etter bytte
      leggTilCTAEvent();
    });
  });
});

