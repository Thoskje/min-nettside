// Husk å inkludere Stripe.js i HTML-filen din:
// <script src="https://js.stripe.com/v3/"></script>
// <script src="js/stripe-checkout.js" defer></script>

// Bytt ut 'pk_test_...' med din Stripe public key!
const stripeClient = Stripe('pk_test_...'); // Din Stripe public key

function startCheckout() {
  fetch('/api/create-checkout-session', { method: 'POST' })
    .then(res => res.json())
    .then(data => stripeClient.redirectToCheckout({ sessionId: data.id }));
}

window.startCheckout = startCheckout;