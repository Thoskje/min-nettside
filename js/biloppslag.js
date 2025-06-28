document.addEventListener('DOMContentLoaded', function() {
  // Elementer
  const regnrInput = document.getElementById('regnr');
  const sokBilBtn = document.getElementById('sok-bil');
  const bilinfoDiv = document.getElementById('bilinfo');
  const godkjennBtn = document.getElementById('godkjenn-bil');
  const lukkBtn = document.getElementById('lukk-biloppslag');

  // Åpne biloppslag når CTA trykkes
  document.querySelectorAll('.cta-button').forEach(btn => {
    if (btn && !btn.classList.contains('kurs-btn')) { // Ikke åpne overlay for kurs-knappen
      btn.addEventListener('click', function() {
        const overlay = document.getElementById('biloppslag-overlay');
        if (overlay) overlay.style.display = 'flex';
      });
    }
  });

  // Lukk biloppslag-overlay
  if (lukkBtn) {
    lukkBtn.addEventListener('click', function() {
      const overlay = document.getElementById('biloppslag-overlay');
      if (overlay) overlay.style.display = 'none';
    });
  }

  // Søk etter bil
  if (sokBilBtn && regnrInput && bilinfoDiv) {
    sokBilBtn.addEventListener('click', async () => {
      const regnr = regnrInput.value.trim().toUpperCase();
      console.log('Søker etter regnr:', regnr);
      
      if (!regnr) {
        alert('Vennligst skriv inn et registreringsnummer.');
        return;
      }
      
      bilinfoDiv.textContent = 'Laster...';
      
      try {
        const url = `/api/bil?regnr=${regnr}`;
        console.log('Henter fra API:', url);
        const res = await fetch(url);
        
        if (!res.ok) {
          console.error('Nettverksresponsen var ikke ok', res.status, res.statusText);
          throw new Error('Nettverksresponsen var ikke ok');
        }
        
        const data = await res.json();
        console.log('Data fra proxy:', data);

        // Sjekk begge mulige feltnavn
        const bilListe = data.kjoretoydataListe || data.kjoretoydata;
        let merke = '';
        let modell = '';
        let arsmodell = '';
        let drivstoff = '';
        let motortype = '';
        let forstegangsregistrert = '';

        if (bilListe && bilListe.length > 0) {
          const bil = bilListe[0];
          console.log('Første bil-objekt:', bil);

          // Hent ut feltene fra objektet
          merke = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke || '';
          modell = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0] || '';
          arsmodell = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.arsmodell || '';
          drivstoff = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.drivstoff || '';
          motortype = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.motortype || '';
          forstegangsregistrert = bil.forstegangsregistrering?.registrertForstegangNorgeDato || '';
        } else {
          // Sjekk alternativ struktur
          merke = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke || '';
          modell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0] || '';
          arsmodell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.arsmodell || '';
          drivstoff = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.drivstoff || '';
          motortype = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.motortype || '';
        }

        if (merke || modell) {
          // Lag bilnavn med årsmodell, drivstoff og motortype
          const bilnavn = `${merke} ${modell} ${arsmodell} ${drivstoff} ${motortype} (${regnr})`;
          localStorage.setItem('bilnavn', bilnavn);
          localStorage.setItem('bilRegistreringsnummer', regnr);
          localStorage.setItem('bilMerke', merke);
          localStorage.setItem('bilModell', modell);
          localStorage.setItem('bilÅr', arsmodell);
          localStorage.setItem('bilMotor', `${drivstoff} ${motortype}`.trim());
          
          // Sett brukernavn i Tawk.to-chatten
          if (window.Tawk_API) {
            window.Tawk_API.setAttributes({
              'name': `${merke} ${modell} (${regnr})`
            }, function(error){});
          }

          // Vis bilinformasjon
          bilinfoDiv.innerHTML = `
            <strong>Bilmerke:</strong> ${merke}<br>
            <strong>Bilmodell:</strong> ${modell}<br>
            <strong>Årsmodell:</strong> ${arsmodell}<br>
            <strong>Drivstoff:</strong> ${drivstoff}<br>
            <strong>Motortype:</strong> ${motortype}<br>
            ${forstegangsregistrert ? `<strong>Førstegangsregistrert:</strong> ${forstegangsregistrert}<br>` : ''}
            <strong>Registreringsnummer:</strong> ${regnr}<br>
          `;

          // Vis godkjenn-knapp
          if (godkjennBtn) godkjennBtn.style.display = 'inline-block';
        } else {
          console.warn('Ingen informasjon funnet for dette registreringsnummeret.');
          bilinfoDiv.innerHTML = 'Ingen informasjon funnet for dette registreringsnummeret.';
          if (godkjennBtn) godkjennBtn.style.display = 'none';
        }
      } catch (e) {
        console.error('Det oppsto en feil:', e);
        bilinfoDiv.innerHTML = 'Det oppsto en feil under henting av bilinformasjon. Vennligst prøv igjen senere.';
        if (godkjennBtn) godkjennBtn.style.display = 'none';
      }
    });
  }

  // Når bruker trykker "Godkjenn" i biloppslag-widget
  if (godkjennBtn) {
    godkjennBtn.addEventListener('click', function() {
      // Lukk biloppslag-overlay
      const overlay = document.getElementById('biloppslag-overlay');
      if (overlay) overlay.style.display = 'none';
      
      // Åpne Stripe Elements-overlay
      const checkoutOverlay = document.getElementById('checkout-overlay');
      if (checkoutOverlay) checkoutOverlay.style.display = 'flex';
    });
  }
});

/**
 * Håndterer progresjonsvisning gjennom de forskjellige stegene
 */
class ProgressStepper {
  constructor() {
    this.currentStep = 1;
    this.progressFill = document.getElementById('progress-fill');
    this.steps = document.querySelectorAll('.step');
    
    // Initialiser første steg
    this.updateProgressBar();
  }
  
  /**
   * Går til et spesifikt steg
   * @param {number} stepNumber - Stegnummer (1-3)
   */
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
  }
  
  /**
   * Går til neste steg
   */
  nextStep() {
    if (this.currentStep < 3) {
      this.goToStep(this.currentStep + 1);
    }
  }
  
  /**
   * Går til forrige steg
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }
  
  /**
   * Oppdaterer progresjonslinjen basert på nåværende steg
   */
  updateProgressBar() {
    // Beregn prosent av fremdrift (0%, 50%, 100%)
    const percent = ((this.currentStep - 1) / 2) * 100;
    this.progressFill.style.width = `${percent}%`;
  }
}

// Initialiser progressStepper når siden er lastet
document.addEventListener('DOMContentLoaded', () => {
  // Globalt tilgjengelig for å kunne brukes av andre deler av applikasjonen
  window.progressStepper = new ProgressStepper();
});