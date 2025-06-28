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

  // Stripe Elements setup
  if (window.Stripe) {
    const stripe = Stripe('pk_test_51RRgZNElNLQwLfbumd8AOKSjDYgs1O3uL1FiHamyNTSArSUW1gRgtVwD70TFKPrJmNvZfpOBVd9emY8Vyyo7HKSX00cp7qONI0'); 
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
    
    // Vis feil ved kortvalidering
    card.on('change', function(event) {
      const messageElement = document.getElementById('payment-message');
      if (event.error) {
        messageElement.textContent = event.error.message;
      } else {
        messageElement.textContent = '';
      }
    });

    // Håndter betaling
    document.getElementById('payment-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      document.getElementById('submit-payment').disabled = true;
      document.getElementById('payment-message').textContent = '';
      
      // Hent biltype fra localStorage for å sende med til backend
      const biltype = localStorage.getItem('bilnavn') || '';

      // Hent clientSecret fra backend - uten email
      let clientSecret;
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ biltype }) // Fjernet email
        });
        const data = await response.json();
        clientSecret = data.clientSecret;
        if (!clientSecret) throw new Error(data.error || 'Ingen clientSecret');
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
        // Lagre betalings-ID for verifisering
        localStorage.setItem('paymentIntentId', paymentIntent.id);
        localStorage.setItem('betalingsStatus', 'betalt');
        
        // Redirect til chat eller success-side
        window.location.href = '/success.html';
      }
    });
  }
