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

    // Håndter betaling
    document.getElementById('payment-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      document.getElementById('submit-payment').disabled = true;
      document.getElementById('payment-message').textContent = '';
      
      // Hent biltype fra localStorage for å sende med til backend
      const biltype = localStorage.getItem('bilnavn') || '';
      const email = document.getElementById('email')?.value || '';

      // Hent clientSecret fra backend
      let clientSecret;
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ biltype, email }) // Send med bilinfo til backend
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
        // Redirect til chat eller success-side
        window.location.href = '/success.html';
      }
    });
  }
