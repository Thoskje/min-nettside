const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripePublicKey = 'pk_test_51RRgZNElNLQwLfbumd8AOKSjDYgs1O3uL1FiHamyNTSArSUW1gRgtVwD70TFKPrJmNvZfpOBVd9emY8Vyyo7HKSX00cp7qONI0'; // <-- din publishable key

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9900, // pris i øre
      currency: 'nok',
      // metadata: { ... } // evt. legg til mer info
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ...stripe.js må være lastet inn...
const stripeJs = Stripe(stripePublicKey);
const elements = stripeJs.elements({
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
const card = elements.create('card', { style });
card.mount('#card-element');