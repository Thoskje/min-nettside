/**
 * api/verify-session.js
 * 
 * API-endepunkt for å verifisere betalingssesjon fra Stripe.
 * Sjekker betalingsstatus og returnerer resultat til klienten.
 * 
 * @author bilrådet.no/TS
 * @version 1.0
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

// Konfigurasjon
const CONFIG = {
  development: {
    logLevel: 'verbose',
    mockSuccess: false, // Sett til true for å simulere suksess i utviklingsmiljø
    savePaymentData: true
  },
  production: {
    logLevel: 'error',
    mockSuccess: false,
    savePaymentData: true
  }
};

// Bestem miljø
const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const config = CONFIG[ENV];

// Logger-funksjon
const logger = {
  info: (message) => {
    if (config.logLevel === 'verbose') console.log(`[INFO] ${message}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  }
};

/**
 * Verifiserer en Stripe checkout sesjon
 * 
 * @param {string} sessionId - Stripe Checkout Session ID
 * @returns {Promise<Object>} Objekt med betalingsstatus
 */
async function verifySession(sessionId) {
  logger.info(`Verifiserer sessionId: ${sessionId}`);
  
  try {
    // Mock-suksess hvis konfigurert for utvikling
    if (config.mockSuccess) {
      logger.info('Bruker mock-suksess for utvikling');
      return {
        paid: true,
        paymentIntent: 'mock_pi_123456',
        customer: 'mock_cus_123456',
        amount: 129,
        currency: 'nok'
      };
    }

    // Hent sesjon fra Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer']
    });

    logger.info(`Session status: ${session.status}`);
    
    // Sjekk om betalingen er vellykket
    const isPaid = session.payment_status === 'paid';
    
    // Lagre betalingsinfo lokalt hvis konfigurert
    if (isPaid && config.savePaymentData) {
      savePaymentData(session);
    }
    
    return {
      paid: isPaid,
      paymentIntent: session.payment_intent?.id || null,
      customer: session.customer?.id || null,
      amount: session.amount_total,
      currency: session.currency
    };
  } catch (error) {
    logger.error('Feil ved verifisering av Stripe-sesjon:', error);
    
    return {
      paid: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Det oppstod en feil ved verifisering av betaling.' 
        : error.message
    };
  }
}

/**
 * Lagrer betalingsdata til lokal fil for analysering/arkivering
 * 
 * @param {Object} session - Stripe-sesjonsobjekt
 */
function savePaymentData(session) {
  try {
    const timestamp = new Date().toISOString();
    const paymentData = {
      timestamp,
      sessionId: session.id,
      paymentIntentId: session.payment_intent?.id,
      customerId: session.customer?.id,
      amount: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email || null,
      customerName: session.customer_details?.name || null,
      metadata: session.metadata || {}
    };
    
    // Sti til lagringsfil
    const logDir = path.join(__dirname, '../logs');
    const logPath = path.join(logDir, 'payments.json');
    
    // Opprett mappen hvis den ikke eksisterer
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Les eksisterende data eller opprett nytt array
    let payments = [];
    if (fs.existsSync(logPath)) {
      try {
        payments = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      } catch (e) {
        logger.error('Feil ved lesing av betalingslogg:', e);
      }
    }
    
    // Legg til ny betaling og lagre
    payments.push(paymentData);
    fs.writeFileSync(logPath, JSON.stringify(payments, null, 2));
    
    logger.info(`Betalingsdata lagret for session ${session.id}`);
  } catch (error) {
    logger.error('Feil ved lagring av betalingsdata:', error);
    // Feil ved lagring skal ikke stoppe resten av prosessen
  }
}

/**
 * Express-rutehåndterer for verifisering av betalingssesjon
 */
module.exports = async (req, res) => {
  const sessionId = req.query.session_id;
  
  if (!sessionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'session_id er påkrevd' 
    });
  }
  
  try {
    const result = await verifySession(sessionId);
    
    if (result.error) {
      return res.status(500).json({
        success: false,
        paid: false,
        message: result.error
      });
    }
    
    return res.status(200).json({
      success: true,
      paid: result.paid,
      paymentIntentId: result.paymentIntent,
      customerId: result.customer
    });
  } catch (error) {
    logger.error('Ukjent feil i API-endepunkt:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Det oppstod en serverfeil.'
    });
  }
};