console.log("main.js lastet");

/* ===========================
   Hide header ved scroll
   =========================== */
document.addEventListener("DOMContentLoaded", function () {
  console.log("hide-header-on-scroll.js loaded");
  let lastScroll = window.pageYOffset || document.documentElement.scrollTop;
  const header = document.querySelector('header');
  const deadzone = 20; // hvor mye du må scrolle før headeren skjules/vises

  if (!header) {
    console.log("Fant ikke <header>!");
    return;
  }

  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Vis alltid header hvis du er helt øverst
    if (currentScroll <= 0) {
      header.style.transform = 'translateY(0)';
    } else if (currentScroll > lastScroll + deadzone && currentScroll > 120) {
      // Scroller ned, og har passert deadzone og 120px
      header.style.transform = 'translateY(-100%)';
      lastScroll = currentScroll;
    } else if (currentScroll < lastScroll - deadzone) {
      // Scroller opp, og har passert deadzone
      header.style.transform = 'translateY(0)';
      lastScroll = currentScroll;
    }
  });
});

/* ===========================
   Accordion-funksjonalitet
   =========================== */
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', function() {
    const body = this.nextElementSibling;
    body.classList.toggle('active');
  });
});

/* ===========================
   Hero-faner: Bytte av innhold ved klikk
   =========================== */
document.addEventListener('DOMContentLoaded', function() {
  // Tabs
  const tabButtons = document.querySelectorAll('.h1-tab');
  const tabContents = document.querySelectorAll('.h1-tab-content');

  function activateTab(tabNum) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.hero-knapper .cta-button').forEach(btn => btn.classList.remove('cta-active'));

    const tabBtn = document.querySelector(`.h1-tab[data-h1="${tabNum}"]`);
    const tabContent = document.getElementById(`h1-tab-${tabNum}`);
    if (tabBtn) tabBtn.classList.add('active');
    if (tabContent) tabContent.classList.add('active');

    if (tabContent) {
      if (tabNum === '1') {
        const btn = tabContent.querySelector('.chat-btn');
        if (btn) btn.classList.add('cta-active');
      } else if (tabNum === '2') {
        const btn = tabContent.querySelector('.avtal-btn');
        if (btn) btn.classList.add('cta-active');
      } else if (tabNum === '3') {
        const btn = tabContent.querySelector('.kurs-btn');
        if (btn) btn.classList.add('cta-active');
      }
    }

    // VIKTIG: Setup scroll-detection for ny aktiv tab
    setTimeout(() => {
      setupScrollDetectionForActiveTab();
    }, 100); // Vent til tab er fullt aktivert
  }

  // Tabs click - oppdatert
  tabButtons.forEach(tabBtn => {
    tabBtn.addEventListener('click', function() {
      const tabNum = tabBtn.getAttribute('data-h1');
      activateTab(tabNum);
    });
  });

  // Aktiver første tab
  activateTab('1');
  
  // CTA-knapp: Kurs
  document.querySelectorAll('.hero-knapper .kurs-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      window.location.href = 'html/kurs.html';
    });
  });

 
  /* ===========================
     Hamburger-meny
     =========================== */
  const menuBtn = document.getElementById('menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (menuBtn && mobileNav) {
    // Lag en variabel for å holde styr på om menyen er åpen
    let menuOpen = false;
    
    // Toggle menyen ved klikk på hamburger-ikonet
    menuBtn.addEventListener('click', function(e) {
      // Hindre at klikket fortsetter til document
      e.stopPropagation();
      
      // Toggle meny og oppdater status
      menuOpen = !menuOpen;
      mobileNav.classList.toggle('open', menuOpen);
      
      // Logg for debugging
      console.log('Hamburger-meny: ' + (menuOpen ? 'åpnet' : 'lukket'));
    });
    
    // Lukk menyen ved klikk på lenke
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        mobileNav.classList.remove('open');
        console.log('Hamburger-meny: lukket via lenke-klikk');
      });
    });
    
    // Lukk menyen ved klikk utenfor
    document.addEventListener('click', function(e) {
      // Sjekk at menyen er åpen, at klikket ikke er på menyen eller på menyknappen
      if (menuOpen && !mobileNav.contains(e.target) && e.target !== menuBtn) {
        menuOpen = false;
        mobileNav.classList.remove('open');
        console.log('Hamburger-meny: lukket via klikk utenfor');
      }
    });
  } else {
    // Logg feil hvis elementer mangler
    if (!menuBtn) console.error('Hamburger-meny: #menu-btn element ikke funnet');
    if (!mobileNav) console.error('Hamburger-meny: #mobile-nav element ikke funnet');
  }

  // OPPDATERT: Scroll-detection funksjon
  function setupScrollDetectionForActiveTab() {
    console.log('🔄 Setting up scroll detection for active tab...');
    
    // Finn kun scroll container i aktiv tab
    const activeTab = document.querySelector('.h1-tab-content.active');
    if (!activeTab) {
      console.log('❌ Ingen aktiv tab funnet');
      return;
    }
    
    const scrollContainer = activeTab.querySelector('.hero-content-scroll');
    if (!scrollContainer) {
      console.log('❌ Ingen scroll container i aktiv tab');
      return;
    }
    
    console.log('✅ Fant scroll container i aktiv tab:', scrollContainer);
    
    // Fjern gamle event listeners (for å unngå duplikater)
    scrollContainer.removeEventListener('scroll', handleScroll);
    
    // Legg til ny listener
    scrollContainer.addEventListener('scroll', handleScroll);
    
    // Initial state check
    updateScrollState(scrollContainer);
    
    function handleScroll() {
      updateScrollState(scrollContainer);
    }
  }

  function updateScrollState(container) {
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrollBottom = scrollHeight - clientHeight - scrollTop;
    
    const isScrollable = scrollHeight > clientHeight;
    const isAtBottom = scrollBottom <= 10;
    
    console.log('📊 Scroll state:', {
      tab: container.closest('.h1-tab-content')?.id,
      scrollable: isScrollable,
      atBottom: isAtBottom,
      scrollBottom: scrollBottom,
      hasClass: container.classList.contains('scrolled-to-bottom')
    });
    
    if (!isScrollable || isAtBottom) {
      container.classList.add('scrolled-to-bottom');
      console.log('➕ Lagt til scrolled-to-bottom klasse');
    } else {
      container.classList.remove('scrolled-to-bottom');
      console.log('➖ Fjernet scrolled-to-bottom klasse');
    }
  }

  // Setup for første tab
  setupScrollDetectionForActiveTab();
});