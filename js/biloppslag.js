document.addEventListener('DOMContentLoaded', function() {
  // DOM-elementer
  const bilOppslagOverlay = document.getElementById('biloppslag-overlay');
  const lukkeKnapp = document.getElementById('lukk-biloppslag');
  const regnrInput = document.getElementById('regnr');
  const sokBilKnapp = document.getElementById('sok-bil');
  const bilinfoElement = document.getElementById('bilinfo');
  const godkjennBilKnapp = document.getElementById('godkjenn-bil');
  
  // Steg-elementer
  const bilOppslagStep = document.getElementById('biloppslag-step');
  const paymentStep = document.getElementById('payment-step');
  const successStep = document.getElementById('success-step');
  const backToBilOppslagBtn = document.getElementById('back-to-biloppslag');
  const startConsultationBtn = document.getElementById('start-consultation');
  
  // Progresjonsklasse
  class BilOppslagStepper {
    constructor() {
      this.currentStep = 1;
      this.progressFill = document.getElementById('progress-fill');
      
      // Initialiser første steg
      this.updateProgressBar();
    }
    
    goToStep(stepNumber) {
      if (stepNumber < 1 || stepNumber > 3) return;
      
      // Marker tidligere steg som fullført
      for (let i = 1; i < stepNumber; i++) {
        document.querySelector(`.step-${i}`).classList.add('completed');
        document.querySelector(`.step-${i}`).classList.remove('active');
      }
      
      // Marker nåværende steg som aktivt
      for (let i = stepNumber; i <= 3; i++) {
        document.querySelector(`.step-${i}`).classList.remove('completed');
        document.querySelector(`.step-${i}`).classList.remove('active');
      }
      document.querySelector(`.step-${stepNumber}`).classList.add('active');
      
      this.currentStep = stepNumber;
      this.updateProgressBar();
      
      // Vis riktig innholdspanel
      this.showStepContent(stepNumber);
    }
    
    updateProgressBar() {
      const percent = ((this.currentStep - 1) / 2) * 100;
      this.progressFill.style.width = `${percent}%`;
    }
    
    showStepContent(step) {
      // Skjul alle steg
      bilOppslagStep.style.display = 'none';
      paymentStep.style.display = 'none';
      successStep.style.display = 'none';
      
      // Vis aktuelt steg
      switch(step) {
        case 1:
          bilOppslagStep.style.display = 'block';
          break;
        case 2:
          paymentStep.style.display = 'block';
          // Smooth scroll til toppen av betalingssteget
          setTimeout(() => {
            paymentStep.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          break;
        case 3:
          successStep.style.display = 'block';
          break;
      }
    }
  }
  
  // Initialiser stepper
  const stepper = new BilOppslagStepper();
  
  // Åpne modal når chat-knappen klikkes
  document.querySelector('.chat-btn').addEventListener('click', function(e) {
    e.preventDefault();
    bilOppslagOverlay.style.display = 'flex';
    stepper.goToStep(1); // Start på steg 1
  });
  
  // Lukk modal når lukkeknappen klikkes
  lukkeKnapp.addEventListener('click', function() {
    bilOppslagOverlay.style.display = 'none';
  });
  
  // Biloppslag-funksjonalitet
  sokBilKnapp.addEventListener('click', function() {
    const regnr = regnrInput.value.trim();
    
    if (!regnr) {
      bilinfoElement.innerHTML = "<p class='error'>Vennligst skriv inn registreringsnummer</p>";
      return;
    }
    
    // Vis laster-animasjon
    bilinfoElement.innerHTML = "<div class='spinner'></div>";
    
    // Simuler API-kall (erstatt med faktisk API-kall)
    setTimeout(() => {
      const bilData = {
        regnr: regnr.toUpperCase(),
        merke: 'Volvo',
        modell: 'V90',
        årsmodell: '2019',
        motor: '2.0 D4'
      };
      
      // Lagre bildata i localStorage for senere bruk
      localStorage.setItem('bilRegistreringsnummer', bilData.regnr);
      localStorage.setItem('bilMerke', bilData.merke);
      localStorage.setItem('bilModell', bilData.modell);
      localStorage.setItem('bilÅr', bilData.årsmodell);
      localStorage.setItem('bilMotor', bilData.motor);
      
      // Vis bilinfo
      bilinfoElement.innerHTML = `
        <div class="bilinfo-resultat">
          <h3>${bilData.merke} ${bilData.modell}</h3>
          <div class="bilinfo-detaljer">
            <p><strong>Registreringsnummer:</strong> ${bilData.regnr}</p>
            <p><strong>Årsmodell:</strong> ${bilData.årsmodell}</p>
            <p><strong>Motor:</strong> ${bilData.motor}</p>
          </div>
        </div>
      `;
      
      // Vis godkjenn-knappen
      godkjennBilKnapp.style.display = 'block';
      
    }, 1000);
  });
  
  // Når brukeren godkjenner bilen
  godkjennBilKnapp.addEventListener('click', function() {
    stepper.goToStep(2); // Gå til betalingssteget
  });
  
  // Tilbake til biloppslag
  backToBilOppslagBtn.addEventListener('click', function() {
    stepper.goToStep(1);
  });
  
  // Stripe integrasjon
  let stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Erstatt med din faktiske Stripe-nøkkel
  let elements;
  let card;
  
  const initializeStripe = () => {
    // Opprett Stripe Elements
    elements = stripe.elements();
    
    // Tilpass utseendet til card elementet
    const style = {
      base: {
        color: '#0c1a2a',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#64748b'
        }
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444'
      }
    };
    
    // Opprett card elementet
    card = elements.create('card', { style });
    
    // Legg til card elementet i DOM
    card.mount('#card-element');
    
    // Håndter validerings-feil
    card.on('change', function(event) {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  };
  
  // Initialiser Stripe når brukeren går til betalingssteget
  godkjennBilKnapp.addEventListener('click', function() {
    if (!elements) {
      initializeStripe();
    }
  });
  
  // Håndter betalingsinnsending
  const paymentForm = document.getElementById('payment-form');
  
  paymentForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-payment');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Behandler...';
    
    try {
      // Opprett Payment Intent på serveren (simulert her)
      const clientSecret = await simulateCreatePaymentIntent();
      
      // Bekreft kortet
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: 'Kunde Navn' // Ideelt sett burde dette fylles ut av brukeren
          }
        }
      });
      
      if (result.error) {
        // Vis feil til brukeren
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
        
        // Gjenopprett knappen
        submitBtn.disabled = false;
        submitBtn.textContent = 'Betal 149 kr';
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          // Betalingen er vellykket
          localStorage.setItem('betalingsStatus', 'betalt');
          localStorage.setItem('paymentIntentId', result.paymentIntent.id);
          
          // Gå til suksess-steget
          stepper.goToStep(3);
        }
      }
    } catch (err) {
      console.error('Feil ved betaling:', err);
      const errorElement = document.getElementById('card-errors');
      errorElement.textContent = 'Det oppstod en teknisk feil. Vennligst prøv igjen.';
      
      // Gjenopprett knappen
      submitBtn.disabled = false;
      submitBtn.textContent = 'Betal 149 kr';
    }
  });
  
  // Simulert funksjon for å opprette Payment Intent (erstatt med faktisk API-kall)
  async function simulateCreatePaymentIntent() {
    return new Promise((resolve) => {
      // Dette ville vanligvis være et API-kall til din server
      setTimeout(() => {
        // Dette er et eksempel-clientSecret. I virkeligheten ville dette komme fra serveren din.
        resolve('pi_1234567890_secret_1234567890');
      }, 700);
    });
  }
  
  // Håndtere start av konsultasjon
  startConsultationBtn.addEventListener('click', function() {
    // Her kan du legge inn koden for å starte chatten/konsultasjonen
    bilOppslagOverlay.style.display = 'none';
    alert('Konsultasjonen starter nå!');
    // For eksempel åpne chat-widgeten:
    // window.FrontChat('show');
  });
  
  // Hvis brukeren klikker utenfor modalen, lukk den
  bilOppslagOverlay.addEventListener('click', function(e) {
    if (e.target === bilOppslagOverlay) {
      bilOppslagOverlay.style.display = 'none';
    }
  });
});