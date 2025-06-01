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
  const kursBtn = document.querySelector('.hero-knapper .kurs-btn');

  // Hjelpefunksjon for å sette knappefarger etter aktiv tab
  function settKnappeFargerEtterTab() {
    // Finn aktiv h1-tab
    const aktivTab = document.querySelector('.h1-tabs .h1-tab.active');
    const tab = aktivTab ? aktivTab.getAttribute('data-h1') : "1";
    if (chatBtn && avtalBtn && kursBtn) {
      if (tab === "1") {
        chatBtn.style.background = "#ff9900";
        avtalBtn.style.background = "#0c1a2a";
        kursBtn.style.background = "#0c1a2a";
      } else if (tab === "2") {
        chatBtn.style.background = "#0c1a2a";
        avtalBtn.style.background = "#ff9900";
        kursBtn.style.background = "#0c1a2a";
      } else if (tab === "3") {
        chatBtn.style.background = "#0c1a2a";
        avtalBtn.style.background = "#0c1a2a";
        kursBtn.style.background = "#ff9900";
      }
    }
  }

  if (avtalBtn && chatBtn && kursBtn) {
    avtalBtn.addEventListener('mouseenter', () => {
      chatBtn.style.background = '#0c1a2a';
      avtalBtn.style.background = '#ff9900';
      kursBtn.style.background = '#0c1a2a';
    });
    avtalBtn.addEventListener('mouseleave', settKnappeFargerEtterTab);

    kursBtn.addEventListener('mouseenter', () => {
      chatBtn.style.background = '#0c1a2a';
      avtalBtn.style.background = '#0c1a2a';
      kursBtn.style.background = '#ff9900';
    });
    kursBtn.addEventListener('mouseleave', settKnappeFargerEtterTab);

    chatBtn.addEventListener('mouseenter', () => {
      chatBtn.style.background = '#ff9900';
      avtalBtn.style.background = '#0c1a2a';
      kursBtn.style.background = '#0c1a2a';
    });
    chatBtn.addEventListener('mouseleave', settKnappeFargerEtterTab);
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

      // Endre CTA-knappene etter valgt tab
      const chatBtn = document.querySelector('.hero-knapper .chat-btn');
      const avtalBtn = document.querySelector('.hero-knapper .avtal-btn');
      const kursBtn = document.querySelector('.hero-knapper .kurs-btn');
      if (chatBtn && avtalBtn && kursBtn) {
        if (tab === "1") {
          chatBtn.style.background = "#ff9900";
          avtalBtn.style.background = "#0c1a2a";
          kursBtn.style.background = "#0c1a2a";
        } else if (tab === "2") {
          chatBtn.style.background = "#0c1a2a";
          avtalBtn.style.background = "#ff9900";
          kursBtn.style.background = "#0c1a2a";
        } else if (tab === "3") {
          chatBtn.style.background = "#0c1a2a";
          avtalBtn.style.background = "#0c1a2a";
          kursBtn.style.background = "#ff9900";
        }
      }
    });
  });
});

document.querySelectorAll('.hero-knapper .kurs-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    window.location.href = 'html/kurs.html';
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
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
});

document.addEventListener('DOMContentLoaded', function() {
  const icon = document.getElementById('hero-more-icon');
  const more = document.getElementById('hero-more-text');
  if (icon && more) {
    icon.addEventListener('click', function() {
      const open = more.style.display === 'inline';
      more.style.display = open ? 'none' : 'inline';
      icon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  }
});

