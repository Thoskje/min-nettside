import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { biltype } = req.body || {};

    // Opprett payment intent uten email
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 14900, // 149 kr i øre
      currency: 'nok',
      description: 'Chat med bilmekaniker',
      metadata: {
        produkt: 'Chat med bilmekaniker',
        biltype: biltype || '',
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Payment Intent Error:', err);
    res.status(500).json({ error: err.message });
  }
}