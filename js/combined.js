document.addEventListener('DOMContentLoaded', function() {
  console.log('Combined widget loaded');
  
  // Referanser til eksisterende funksjoner og komponenter
  const bilOppslagOverlay = document.getElementById('biloppslag-overlay');
  const checkoutOverlay = document.getElementById('checkout-overlay');
  
  // Funksjoner for å vise/skjule overlayet
  function showBiloppslag() {
    bilOppslagOverlay.style.display = 'flex';
  }
  
  function hideBiloppslag() {
    bilOppslagOverlay.style.display = 'none';
  }
  
  function showCheckout() {
    checkoutOverlay.style.display = 'flex';
  }
  
  function hideCheckout() {
    checkoutOverlay.style.display = 'none';
  }
  
  // Overstyr eksisterende lukkeknapp på biloppslag for å gå til Stripe isteden
  const godkjennBilKnapp = document.getElementById('godkjenn-bil');
  if (godkjennBilKnapp) {
    // Fjern eventuelle eksisterende event listeners (optional)
    const newGodkjennBilKnapp = godkjennBilKnapp.cloneNode(true);
    godkjennBilKnapp.parentNode.replaceChild(newGodkjennBilKnapp, godkjennBilKnapp);
    
    // Legg til ny event listener som kobler biloppslag og Stripe
    newGodkjennBilKnapp.addEventListener('click', function() {
      console.log('Biloppslag godkjent - går til betaling');
      
      // Skjul biloppslag
      hideBiloppslag();
      
      // Oppdater bilinfo i checkout
      updateCheckoutWithBilInfo();
      
      // Vis checkout
      showCheckout();
      
      // Initialiser Stripe hvis det ikke allerede er gjort
      if (window.stripeElements && typeof window.stripeElements.initialize === 'function') {
        window.stripeElements.initialize();
      }
    });
  }
  
  // Legg til tilbakeknapp i Stripe-checkout
  const closeCheckoutBtn = document.getElementById('close-checkout');
  if (closeCheckoutBtn) {
    // Fjern eventuelle eksisterende event listeners (optional)
    const newCloseCheckoutBtn = closeCheckoutBtn.cloneNode(true);
    closeCheckoutBtn.parentNode.replaceChild(newCloseCheckoutBtn, closeCheckoutBtn);
    
    // Legg til ny event listener som går tilbake til biloppslag
    newCloseCheckoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Skjul checkout
      hideCheckout();
      
      // Vis biloppslag med data
      showBiloppslag();
    });
  }
  
  // Oppdater betalingsinformasjon med bildata
  function updateCheckoutWithBilInfo() {
    const checkoutSummary = document.querySelector('.checkout-summary');
    if (!checkoutSummary) return;
    
    const bilMerke = localStorage.getItem('bilMerke') || 'Ukjent';
    const bilModell = localStorage.getItem('bilModell') || 'Ukjent';
    const regnr = localStorage.getItem('bilRegistreringsnummer') || 'Ukjent';
    
    // Oppdater checkout summary med bilinformasjon
    checkoutSummary.innerHTML = `
      <strong>Du betaler for:</strong>
      <ul>
        <li>Chat med bilmekaniker for ${bilMerke} ${bilModell} (${regnr}) – 149 kr</li>
      </ul>
    `;
  }
  
  // Overstyr eksisterende betalingsknapp for å håndtere vellykket betaling
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
      // La den originale hendelsen fortsette, men legg til ekstra logikk ved vellykket betaling
      // Dette vil ikke blokkere den originale funksjonaliteten
      
      const originalSubmitHandler = e.currentTarget.onsubmit;
      
      // Når betalingen er vellykket, åpne chat
      document.addEventListener('payment:success', function() {
        console.log('Payment successful, triggering chat');
        
        // Skjul checkout
        hideCheckout();
        
        // Åpne chat/front widget om du har det
        if (window.FrontChat) {
          window.FrontChat('show');
        }
        
        // Du kan også sende data til chat om ønskelig
        if (window.FrontChat) {
          const bilMerke = localStorage.getItem('bilMerke') || 'Ukjent';
          const bilModell = localStorage.getItem('bilModell') || 'Ukjent';
          const regnr = localStorage.getItem('bilRegistreringsnummer') || 'Ukjent';
          
          window.FrontChat('setUserData', {
            bil: `${bilMerke} ${bilModell}`,
            regnr: regnr
          });
        }
      });
    });
  }
  
  // Lytt etter betalingssuksess-hendelse fra Stripe-koden
  // Dette må legges til i stripe-elements.js
});