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
document.addEventListener('DOMContentLoaded', async function() {
  // Tabs
  const tabButtons = document.querySelectorAll('.h1-tab');
  const tabContents = document.querySelectorAll('.h1-tab-content');

  function activateTab(tabNum) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.hero-knapper .cta-button').forEach(btn => btn.classList.remove('cta-active'));

    const tabBtn = document.querySelector('.h1-tab[data-h1="' + tabNum + '"]');
    const tabContent = document.getElementById('h1-tab-' + tabNum);
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
  }

  // Tabs click
  tabButtons.forEach(function(tabBtn) {
    tabBtn.addEventListener('click', function() {
      const tabNum = tabBtn.getAttribute('data-h1');
      activateTab(tabNum);
    });
  });

  // Aktiver første tab og CTA-knapp ved lasting
  activateTab('1');

  // CTA-knapp: Kurs
  document.querySelectorAll('.hero-knapper .kurs-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      window.location.href = 'html/kurs.html';
    });
  });

  /* ===========================
     Biloppslag-widget som overlay/modal
     =========================== */
  // Åpne overlay når CTA trykkes
  document.querySelectorAll('.cta-button').forEach(btn => {
    btn.addEventListener('click', function() {
      const overlay = document.getElementById('biloppslag-overlay');
      if (overlay) overlay.style.display = 'flex';
    });
  });

  // Lukk overlay
  const lukkBtn = document.getElementById('lukk-biloppslag');
  if (lukkBtn) {
    lukkBtn.addEventListener('click', function() {
      const overlay = document.getElementById('biloppslag-overlay');
      if (overlay) overlay.style.display = 'none';
    });
  }

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

  /* ===========================
     Biloppslag-funksjonalitet
     =========================== */
  const sokBilBtn = document.getElementById('sok-bil');
  if (sokBilBtn) {
    sokBilBtn.addEventListener('click', function() {
      const regnrInput = document.getElementById('regnr');
      if (!regnrInput) return;
      const regnr = regnrInput.value.trim();
      if (!regnr) return;

      fetch(`/api/bil?regnr=${regnr}`)
        .then(res => res.json())
        .then(data => {
          const merke = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke || '';
          const modell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0] || '';
          const arsmodell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.arsmodell || '';
          const drivstoff = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.drivstoff || '';
          const motortype = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.motortype || '';
          const regnrUpper = regnr.toUpperCase();

          const bilinfoDiv = document.getElementById('bilinfo');
          if (bilinfoDiv) {
            bilinfoDiv.innerHTML = `
              <strong>Bilmerke:</strong> ${merke}<br>
              <strong>Bilmodell:</strong> ${modell}<br>
              <strong>Årsmodell:</strong> ${arsmodell}<br>
              <strong>Drivstoff:</strong> ${drivstoff}<br>
              <strong>Motortype:</strong> ${motortype}<br>
              <strong>Registreringsnummer:</strong> ${regnrUpper}<br>
            `;
          }

          // Lagre bilnavn for evt. chat
          const bilnavn = `${merke} ${modell} ${arsmodell} ${drivstoff} ${motortype} (${regnrUpper})`;
          localStorage.setItem('bilnavn', bilnavn);

          // Vis godkjenn-knapp
          const godkjennBtn = document.getElementById('godkjenn-bil');
          if (godkjennBtn) godkjennBtn.style.display = 'inline-block';
        });
    });
  }

  // Stripe-flyt: kun fra godkjenn-knapp
  const stripe = Stripe('pk_test_51RRgZNElNLQwLfbumd8AOKSjDYgs1O3uL1FiHamyNTSArSUW1gRgtVwD70TFKPrJmNvZfpOBVd9emY8Vyyo7HKSX00cp7qONI0'); // <-- Sett inn din publishable key
  const elements = stripe.elements();
  const card = elements.create('card', {
  style: style,
  hidePostalCode: true
});
card.mount('#card-element');

  // Vis Stripe-skjema når bruker har godkjent biltype
  const godkjennBtn = document.getElementById('godkjenn-bil');
  if (godkjennBtn) {
    godkjennBtn.addEventListener('click', function() {
      this.style.display = 'none';
      document.getElementById('payment-form').style.display = 'flex';
    });
  }

  // Åpne Stripe-modul når du ønsker (f.eks. på knappetrykk)
  document.querySelectorAll('.cta-button').forEach(btn => {
    btn.addEventListener('click', function() {
      const overlay = document.getElementById('checkout-overlay');
      if (overlay) overlay.style.display = 'flex';
    });
  });

  // Lukk Stripe-modul
  const closeBtn = document.getElementById('close-checkout');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      const overlay = document.getElementById('checkout-overlay');
      if (overlay) overlay.style.display = 'none';
    });
  }

  // Stripe Elements setup
  document.addEventListener('DOMContentLoaded', function() {
    if (!window.Stripe) return;
    const stripe = Stripe('pk_test_51RRgZNElNLQwLfbumd8AOKSjDYgs1O3uL1FiHamyNTSArSUW1gRgtVwD70TFKPrJmNvZfpOBVd9emY8Vyyo7HKSX00cp7qONI0'); // <-- din publishable key
    const elements = stripe.elements({
      fonts: [{ cssSrc: 'https://fonts.googleapis.com/css?family=Inter:400,600,700' }]
    });
    const style = {
      base: {
        color: "#0c1a2a",
        fontFamily: 'Inter, Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": { color: "#aab7c4" }
      },
      invalid: { color: "#e5424d", iconColor: "#e5424d" }
    };
    const card = elements.create('card', { style, hidePostalCode: true });
    card.mount('#card-element');

    // Håndter betaling
    document.getElementById('payment-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      document.getElementById('submit-payment').disabled = true;
      document.getElementById('payment-message').textContent = '';

      // Hent clientSecret fra backend
      let clientSecret;
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        clientSecret = data.clientSecret;
      } catch (err) {
        document.getElementById('payment-message').textContent = 'Kunne ikke starte betaling.';
        document.getElementById('submit-payment').disabled = false;
        return;
      }

      // Bekreft betaling
      const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: card }
      });

      if (error) {
        document.getElementById('payment-message').textContent = error.message;
        document.getElementById('submit-payment').disabled = false;
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        document.getElementById('payment-message').style.color = 'green';
        document.getElementById('payment-message').textContent = 'Betaling fullført!';
        // Her kan du åpne chat, redirecte, eller vise success-melding
      }
    });
  });
});



