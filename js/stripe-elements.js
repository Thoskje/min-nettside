/* ===========================
     Stripe Elements
     =========================== */
  // Lukk Stripe-overlay
  const closeBtn = document.getElementById('close-checkout');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      const overlay = document.getElementById('checkout-overlay');
      if (overlay) overlay.style.display = 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Stripe integrasjon
    let stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Erstatt med din faktiske Stripe-nøkkel
    let elements;
    let card;
    let stripeElementsInitialized = false;
    
    // Eksporter til window for tilgang fra andre scripts
    window.stripeElements = {
      initialize: initializeStripe,
      stripe: stripe,
      initialized: () => stripeElementsInitialized
    };
    
    function initializeStripe() {
      if (stripeElementsInitialized) return;
      
      const cardElement = document.getElementById('card-element');
      if (!cardElement) return;
      
      // Opprett Stripe Elements
      elements = stripe.elements();
      
      // Tilpass utseendet til card elementet
      const style = {
        base: {
          color: '#0c1a2a',
          fontFamily: '"Inter", sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#64748b'
          }
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444'
        }
      };
      
      // Opprett card elementet
      card = elements.create('card', { style });
      
      // Legg til card elementet i DOM
      card.mount('#card-element');
      
      // Håndter validerings-feil
      card.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (displayError) {
          if (event.error) {
            displayError.textContent = event.error.message;
          } else {
            displayError.textContent = '';
          }
        }
      });
      
      stripeElementsInitialized = true;
    }
    
    // Sjekk om betalingsform eksisterer på siden
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
      paymentForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const submitBtn = document.getElementById('submit-payment');
        if (!submitBtn) return;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Behandler...';
        
        try {
          const bilMerke = localStorage.getItem('bilMerke') || '';
          const bilModell = localStorage.getItem('bilModell') || '';
          const regnr = localStorage.getItem('bilRegistreringsnummer') || '';
          
          // Opprett Payment Intent på serveren
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: 149, // 149 kr
              currency: 'nok',
              metadata: {
                bilinfo: `${bilMerke} ${bilModell}`,
                regnr: regnr
              }
            }),
          });
          
          if (!response.ok) {
            throw new Error('Kunne ikke opprette betalingsforespørsel');
          }
          
          const paymentData = await response.json();
          
          // Bekreft kortet
          const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
            payment_method: {
              card: card,
              billing_details: {
                name: 'Kunde' // Ideelt sett burde dette fylles ut av brukeren
              }
            }
          });
          
          if (result.error) {
            // Vis feil til brukeren
            const errorElement = document.getElementById('card-errors');
            if (errorElement) {
              errorElement.textContent = result.error.message;
            }
            
            // Gjenopprett knappen
            submitBtn.disabled = false;
            submitBtn.textContent = 'Betal 149 kr';
          } else {
            if (result.paymentIntent.status === 'succeeded') {
              // Betalingen er vellykket
              localStorage.setItem('betalingsStatus', 'betalt');
              localStorage.setItem('paymentIntentId', result.paymentIntent.id);
              localStorage.setItem('sessionId', paymentData.id);
              
              // Gå til suksess-steget
              if (window.bilOppslagStepper) {
                window.bilOppslagStepper.goToStep(3);
              } else {
                // Redirect til bekreftelsessiden hvis vi ikke er i biloppslag-widget
                window.location.href = "/html/bekreftelse.html";
              }
            }
          }
        } catch (err) {
          console.error('Feil ved betaling:', err);
          const errorElement = document.getElementById('card-errors');
          if (errorElement) {
            errorElement.textContent = 'Det oppstod en teknisk feil. Vennligst prøv igjen.';
          }
          
          // Gjenopprett knappen
          submitBtn.disabled = false;
          submitBtn.textContent = 'Betal 149 kr';
        }
      });
    }
  });
