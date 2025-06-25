import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { payment_intent_id } = req.query;
  
  // Sjekk om vi fikk en payment_intent_id
  if (!payment_intent_id) return res.status(400).json({ paid: false });

  try {
    // Hent Payment Intent fra Stripe API
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    // Sjekk om betalingen er fullført
    // Med Stripe Elements er en vellykket betaling markert med status 'succeeded'
    res.json({ 
      paid: paymentIntent.status === 'succeeded',
      amount: paymentIntent.amount / 100, // Beløp i kroner (Stripe lagrer i øre)
      customer: paymentIntent.customer,
      payment_method: paymentIntent.payment_method
    });
  } catch (err) {
    console.error('Feil ved verifisering av Payment Intent:', err);
    res.status(500).json({ paid: false, error: err.message });
  }
}