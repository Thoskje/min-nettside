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
  
  // Initialiser stepper og gjør den global tilgjengelig
  window.bilOppslagStepper = new BilOppslagStepper();
  
  // Åpne modal når chat-knappen klikkes
  document.querySelectorAll('.chat-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      bilOppslagOverlay.style.display = 'flex';
      window.bilOppslagStepper.goToStep(1); // Start på steg 1
    });
  });
  
  // Lukk modal når lukkeknappen klikkes
  if (lukkeKnapp) {
    lukkeKnapp.addEventListener('click', function() {
      bilOppslagOverlay.style.display = 'none';
    });
  }
  
  // Biloppslag-funksjonalitet
  if (sokBilKnapp) {
    sokBilKnapp.addEventListener('click', function() {
      const regnr = regnrInput.value.trim().toUpperCase();
      
      if (!regnr) {
        bilinfoElement.innerHTML = "<p class='error'>Vennligst skriv inn registreringsnummer</p>";
        return;
      }
      
      // Vis laster-animasjon
      bilinfoElement.innerHTML = "<div class='spinner'></div>";
      
      console.log(`Sending request for registration: ${regnr}`);
      
      // Faktisk API-kall til vår egen endpoint
      fetch(`/api/bil?regnr=${encodeURIComponent(regnr)}`)
        .then(response => {
          console.log(`Response status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('Received data from API:', data);
          
          if (data.error) {
            console.error('Error from API:', data.error);
            bilinfoElement.innerHTML = `<p class='error'>${data.error}</p>`;
            return;
          }
          
          // Lagre bildata i localStorage for senere bruk
          localStorage.setItem('bilRegistreringsnummer', data.regnr || regnr);
          localStorage.setItem('bilMerke', data.merke || 'Ukjent');
          localStorage.setItem('bilModell', data.modell || 'Ukjent');
          localStorage.setItem('bilÅr', data.årsmodell || 'Ukjent');
          localStorage.setItem('bilMotor', data.motor || 'Ukjent');
          
          console.log('Saved to localStorage:', {
            regnr: data.regnr || regnr,
            merke: data.merke || 'Ukjent',
            modell: data.modell || 'Ukjent',
            år: data.årsmodell || 'Ukjent',
            motor: data.motor || 'Ukjent'
          });
          
          // Vis bilinfo
          bilinfoElement.innerHTML = `
            <div class="bilinfo-resultat">
              <h3>${data.merke || 'Ukjent'} ${data.modell || 'Ukjent'}</h3>
              <div class="bilinfo-detaljer">
                <p><strong>Registreringsnummer:</strong> ${data.regnr || regnr}</p>
                <p><strong>Årsmodell:</strong> ${data.årsmodell || 'Ukjent'}</p>
                <p><strong>Motor:</strong> ${data.motor || 'Ukjent'}</p>
              </div>
            </div>
          `;
          
          // Vis godkjenn-knappen
          godkjennBilKnapp.style.display = 'block';
        })
        .catch(error => {
          console.error('Error with biloppslag request:', error);
          bilinfoElement.innerHTML = `<p class='error'>Kunne ikke hente bilinformasjon: ${error.message}</p>`;
        });
    });
  }
  
  // Når brukeren godkjenner bilen
  if (godkjennBilKnapp) {
    godkjennBilKnapp.addEventListener('click', function() {
      window.bilOppslagStepper.goToStep(2); // Gå til betalingssteget
      
      // Initialiser Stripe Elements hvis den ikke er initialisert ennå
      if (window.stripeElements && !window.stripeElementsInitialized) {
        window.stripeElements.initialize();
      }
    });
  }
  
  // Tilbake til biloppslag
  if (backToBilOppslagBtn) {
    backToBilOppslagBtn.addEventListener('click', function() {
      window.bilOppslagStepper.goToStep(1);
    });
  }
  
  // Håndtere start av konsultasjon
  if (startConsultationBtn) {
    startConsultationBtn.addEventListener('click', function() {
      bilOppslagOverlay.style.display = 'none';
      
      // Åpne chat/front widget
      if (window.FrontChat) {
        window.FrontChat('show');
      }
      
      // Redirect til success-siden ved behov
      // window.location.href = "/html/bekreftelse.html";
    });
  }
  
  // Hvis brukeren klikker utenfor modalen, lukk den
  if (bilOppslagOverlay) {
    bilOppslagOverlay.addEventListener('click', function(e) {
      if (e.target === bilOppslagOverlay) {
        bilOppslagOverlay.style.display = 'none';
      }
    });
  }
  
  // Feltvalidering på registreringsnummer
  if (regnrInput) {
    regnrInput.addEventListener('input', function() {
      const value = this.value.toUpperCase();
      this.value = value.replace(/[^A-Z0-9]/g, ''); // Kun tillat bokstaver og tall
    });
  }
});