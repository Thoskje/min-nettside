// Husk å inkludere Stripe.js i HTML-filen din:
// <script src="https://js.stripe.com/v3/"></script>
// <script src="js/stripe-checkout.js" defer></script>

// Bytt ut 'pk_test_...' med din Stripe public key!
const stripeClient = Stripe('pk_test_51RRgZNElNLQwLfbumd8AOKSjDYgs1O3uL1FiHamyNTSArSUW1gRgtVwD70TFKPrJmNvZfpOBVd9emY8Vyyo7HKSX00cp7qONI0');

function startCheckout() {
  fetch('/api/create-checkout-session', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (data.id) {
        stripeClient.redirectToCheckout({ sessionId: data.id });
      } else {
        alert('Ingen sessionId fra backend.');
      }
    })
    .catch(err => {
      alert('Feil fra backend: ' + err);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.stripe-btn').forEach(btn => {
    btn.addEventListener('click', startCheckout);
  });
});

window.startCheckout = startCheckout;