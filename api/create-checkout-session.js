const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
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
      success_url: 'https://min-nettside-qdbhei9ew-thomas-s-projects-fd5b29c6.vercel.app/success',
      cancel_url: 'https://min-nettside-qdbhei9ew-thomas-s-projects-fd5b29c6.vercel.app/cancel',
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    res.status(500).send('Stripe error: ' + JSON.stringify(err));
  }
};