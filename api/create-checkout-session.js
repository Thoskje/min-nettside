import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      line_items: [
        {
          price_data: {
            currency: 'nok',
            product_data: { name: 'Chat med bilmekaniker' },
            unit_amount: 14900,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://dittdomene.no/success.html',
      cancel_url: 'https://dittdomene.no/cancel.html',
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
}