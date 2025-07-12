/**
 * Biloppslag og betaling widget */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Widget script loaded');
  
  // ============= DOM-elementer =============
  const widgetOverlay = document.getElementById('biloppslagbetaling-overlay');
  const closeBtn = document.getElementById('widget-close');
  const cancelBtn = document.getElementById('widget-cancel');
  
  // Steg 1: Biloppslag
  const regnrInput = document.getElementById('widget-regnr');
  const sokBtn = document.getElementById('widget-sok-bil');
  const bilinfoDiv = document.getElementById('widget-bilinfo');
  const godkjennBtn = document.getElementById('widget-godkjenn');
  
  // Steg 2: Betaling
  const bilDisplay = document.getElementById('widget-bil-display');
  const paymentForm = document.getElementById('widget-payment-form');
  const cardElement = document.getElementById('widget-card-element');
  const paymentError = document.getElementById('widget-payment-error');
  const backBtn = document.getElementById('widget-back');
  const betalBtn = document.getElementById('widget-betal');
  
  // Steg 3: Chat
  const startChatBtn = document.getElementById('widget-start-chat');
  
  // Steg-elementer
  const stepElements = document.querySelectorAll('.step');
  const stepContents = document.querySelectorAll('.step-content');
  
  // ============= Stripe-oppsett =============
  let stripe, elements, card;
  let stripeInitialized = false;
  
  function initStripe() {
    if (stripeInitialized) return;
    
    try {
      // Bruk din Stripe public key
      stripe = Stripe('pk_test_51RRgZNElNLQwLfbumd8AOKSjDYgs1O3uL1FiHamyNTSArSUW1gRgtVwD70TFKPrJmNvZfpOBVd9emY8Vyyo7HKSX00cp7qONI0');
      elements = stripe.elements({
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
      
      card = elements.create('card', { style, hidePostalCode: true });
      card.mount('#widget-card-element');
      
      // Håndter validerings-feil
      card.on('change', function(event) {
        if (event.error) {
          paymentError.textContent = event.error.message;
        } else {
          paymentError.textContent = '';
        }
      });
      
      stripeInitialized = true;
      console.log('Stripe initialized');
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      paymentError.textContent = 'Kunne ikke laste betalingsløsning';
    }
  }
  
  // ============= Widget-navigering =============
  const widget = {
    currentStep: 1,
    
    goToStep: function(step) {
      // Skjul alle steg
      stepContents.forEach(content => content.classList.remove('active'));
      stepElements.forEach(step => step.classList.remove('active', 'completed'));
      
      // Vis valgt steg
      document.getElementById(`step-${step}`).classList.add('active');
      
      // Oppdater step-indikatorer
      stepElements.forEach(el => {
        const stepNum = parseInt(el.dataset.step);
        if (stepNum < step) {
          el.classList.add('completed');
        } else if (stepNum === step) {
          el.classList.add('active');
        }
      });
      
      this.currentStep = step;
      
      // Initialiser Stripe på steg 2
      if (step === 2 && !stripeInitialized) {
        initStripe();
        this.updatePaymentDisplay();
      }
    },
    
    updatePaymentDisplay: function() {
      if (!bilDisplay) return;
      
      const bilMerke = localStorage.getItem('bilMerke') || '';
      const bilModell = localStorage.getItem('bilModell') || '';
      const regnr = localStorage.getItem('bilRegistreringsnummer') || '';
      const bilAr = localStorage.getItem('bilÅr') || '';
      
      bilDisplay.innerHTML = `
        <div class="payment-widget">
          <p><strong>${bilMerke} ${bilModell} ${bilAr}</strong></p>
          <p>Reg.nr: ${regnr}</p>
          <p>Chat-konsultasjon med bilmekaniker</p>
        </div>
      `;
    },
    
    open: function() {
      widgetOverlay.style.display = 'flex';
      this.goToStep(1);
      
      // Reset data
      regnrInput.value = '';
      bilinfoDiv.innerHTML = '';
      godkjennBtn.style.display = 'none';
      paymentError.textContent = '';
    },
    
    close: function() {
      widgetOverlay.style.display = 'none';
    }
  };
  
  // ============= Event Listeners =============
  
  // Åpne widget når knappen trykkes
  document.querySelectorAll('.chat-btn, .cta-button').forEach(btn => {
    if (btn && !btn.classList.contains('kurs-btn')) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        widget.open();
      });
    }
  });
  
  // Lukkeknapper
  if (closeBtn) closeBtn.addEventListener('click', () => widget.close());
  if (cancelBtn) cancelBtn.addEventListener('click', () => widget.close());
  
  // Lukk ved klikk utenfor modal
  widgetOverlay.addEventListener('click', function(e) {
    if (e.target === widgetOverlay) widget.close();
  });
  
  // Biloppslag funksjonalitet
  if (sokBtn && regnrInput) {
    sokBtn.addEventListener('click', async function() {
      const regnr = regnrInput.value.trim().toUpperCase();
      
      if (!regnr) {
        alert('Vennligst skriv inn et registreringsnummer.');
        return;
      }
      
      bilinfoDiv.innerHTML = '<div class="loader">Søker...</div>';
      godkjennBtn.style.display = 'none';
      
      try {
        const url = `/api/bil?regnr=${encodeURIComponent(regnr)}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Bruk samme biloppslag-logikk som i original biloppslag.js
        const bilListe = data.kjoretoydataListe || data.kjoretoydata;
        let merke = '';
        let modell = '';
        let arsmodell = '';
        let drivstoff = '';
        let motortype = '';
        let forstegangsregistrert = '';

        if (bilListe && bilListe.length > 0) {
          const bil = bilListe[0];
          
          // Hent ut feltene fra objektet
          merke = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke || '';
          modell = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0] || '';
          arsmodell = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.arsmodell || '';
          drivstoff = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.drivstoff || '';
          motortype = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.motortype || '';
          forstegangsregistrert = bil.forstegangsregistrering?.registrertForstegangNorgeDato || '';
        } else {
          // Sjekk alternativ struktur
          merke = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke || '';
          modell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0] || '';
          arsmodell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.arsmodell || '';
          drivstoff = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.drivstoff || '';
          motortype = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.motortype || '';
        }
        
        if (merke || modell) {
          // Lagre data i localStorage
          const bilnavn = `${merke} ${modell} ${arsmodell} ${drivstoff} ${motortype} (${regnr})`;
          localStorage.setItem('bilnavn', bilnavn);
          localStorage.setItem('bilRegistreringsnummer', regnr);
          localStorage.setItem('bilMerke', merke);
          localStorage.setItem('bilModell', modell);
          localStorage.setItem('bilÅr', arsmodell);
          localStorage.setItem('bilMotor', `${drivstoff} ${motortype}`.trim());
          
          // Vis bilinformasjon
          bilinfoDiv.innerHTML = `
            <div class="bil-info">
              <strong>Bilmerke:</strong> ${merke}<br>
              <strong>Bilmodell:</strong> ${modell}<br>
              <strong>Årsmodell:</strong> ${arsmodell}<br>
              <strong>Drivstoff:</strong> ${drivstoff}<br>
              <strong>Motortype:</strong> ${motortype}<br>
              ${forstegangsregistrert ? `<strong>Førstegangsregistrert:</strong> ${forstegangsregistrert}<br>` : ''}
              <strong>Registreringsnummer:</strong> ${regnr}<br>
            </div>
          `;
          
          // Vis godkjenn-knapp
          godkjennBtn.style.display = 'block';
          
          // Sett bilinformasjon i Tawk hvis tilgjengelig
          if (window.Tawk_API) {
            window.Tawk_API.setAttributes({
              'name': `${merke} ${modell} (${regnr})`
            }, function(error){});
          }
        } else {
          bilinfoDiv.innerHTML = '<p class="error">Ingen informasjon funnet for dette registreringsnummeret.</p>';
          godkjennBtn.style.display = 'none';
        }
      } catch (error) {
        console.error('Error fetching car data:', error);
        bilinfoDiv.innerHTML = `<p class="error">Det oppsto en feil under søk. Vennligst prøv igjen.</p>`;
        godkjennBtn.style.display = 'none';
      }
    });
  }
  
  // Godkjenn bil og gå til betaling
  if (godkjennBtn) {
    godkjennBtn.addEventListener('click', function() {
      widget.goToStep(2);
    });
  }
  
  // Tilbake til biloppslag
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      widget.goToStep(1);
    });
  }
  
  // Håndter betaling
  if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (betalBtn) betalBtn.disabled = true;
      paymentError.textContent = '';
      
      // Hent biltype fra localStorage
      const biltype = localStorage.getItem('bilnavn') || '';
      
      try {
        // Hent clientSecret fra backend
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ biltype })
        });
        
        const data = await response.json();
        
        if (!data.clientSecret) {
          throw new Error(data.error || 'Ingen betalingsnøkkel mottatt');
        }
        
        // Bekreft betaling med Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: { card: card }
        });
        
        if (error) {
          paymentError.textContent = error.message || 'Betalingen ble ikke godkjent';
          betalBtn.disabled = false;
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          // Lagre betalingsinfo i localStorage
          localStorage.setItem('paymentIntentId', paymentIntent.id);
          localStorage.setItem('betalingsStatus', 'betalt');
          
          // Gå til bekreftelse
          widget.goToStep(3);
        }
      } catch (error) {
        console.error('Payment error:', error);
        paymentError.textContent = 'Det oppsto en teknisk feil. Vennligst prøv igjen.';
        betalBtn.disabled = false;
      }
    });
  }
  
  // Start chat etter vellykket betaling
  if (startChatBtn) {
    startChatBtn.addEventListener('click', function() {
      widget.close();
      
      // Start chat basert på hva som er tilgjengelig
      if (window.Tawk_API) {
        window.Tawk_API.toggle(); // Åpne Tawk.to
      } else if (window.FrontChat) {
        window.FrontChat('show'); // Åpne FrontChat
      } else {
        // Redirect til success-side som fallback
        window.location.href = '/success.html';
      }
    });
  }
  
  // Registreringsnummer validering
  if (regnrInput) {
    regnrInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
  }
});