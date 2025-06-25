import Stripe from 'stripe'; // Bruk import hvis du har "type": "module" i package.json
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9900, // pris i øre
      currency: 'nok',
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}