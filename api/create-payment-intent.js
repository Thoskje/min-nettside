import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { biltype, email } = req.body || {};

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 14900, // 149 kr i øre
      currency: 'nok',
      description: 'Chat med bilmekaniker',
      receipt_email: email,
      metadata: {
        produkt: 'Chat med bilmekaniker',
        biltype: biltype || '',
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
    if (paymentIntent && paymentIntent.status === 'succeeded') {
  window.location.href = '/success.html';
}
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}