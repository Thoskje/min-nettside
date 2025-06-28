/**
 * Bilinfo Display - Håndterer visning av bilinformasjon
 */
class BilinfoDisplay {
  constructor(elementId) {
    this.elementId = elementId;
  }
  
  // Vis bilinformasjon fra localStorage
  display() {
    const bilinfoElement = document.getElementById(this.elementId);
    if (!bilinfoElement) return;
    
    // Hent lagret bilinfo fra localStorage med flere mulige nøkkelnavn
    const keyMappings = {
      regnr: ['bilRegistreringsnummer', 'regNr', 'regnr', 'bilnummer', 'registreringsnummer'],
      merke: ['bilMerke', 'merke', 'produsent', 'brand'],
      modell: ['bilModell', 'modell', 'model'],
      år: ['bilÅr', 'år', 'year', 'aarsmodell', 'årsmodell'],
      motor: ['bilMotor', 'motor', 'engine', 'motortype']
    };
    
    // Funksjon for å finne første ikke-tomme verdi fra mulige nøkler
    const getFirstValue = (keys) => {
      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) return value;
      }
      return null;
    };
    
    // Hent verdier med fallback til alternative nøkkelnavn
    const regnr = getFirstValue(keyMappings.regnr);
    const bilmerke = getFirstValue(keyMappings.merke);
    const bilmodell = getFirstValue(keyMappings.modell);
    const bilaar = getFirstValue(keyMappings.år);
    const bilmotor = getFirstValue(keyMappings.motor);
    
    // Forsøk å hente fra sessionStorage hvis localStorage ikke har verdiene
    if (!regnr && !bilmerke) {
      const sessRegnr = sessionStorage.getItem('bilRegistreringsnummer') || sessionStorage.getItem('regNr');
      const sessMerke = sessionStorage.getItem('bilMerke') || sessionStorage.getItem('merke');
      
      if (sessRegnr || sessMerke) {
        bilinfoElement.innerHTML = `
          <div class="bilinfo-grid">
            <div class="bilinfo-row">
              <span class="bilinfo-label">Registreringsnummer:</span>
              <span class="bilinfo-value">${sessRegnr || 'Ikke tilgjengelig'}</span>
            </div>
            <div class="bilinfo-row">
              <span class="bilinfo-label">Merke:</span>
              <span class="bilinfo-value">${sessMerke || 'Ikke tilgjengelig'}</span>
            </div>
          </div>
        `;
        return;
      }
    }
    
    if (regnr || bilmerke) {
      // Formater og vis bilinformasjonen
      bilinfoElement.innerHTML = `
        <div class="bilinfo-grid">
          <div class="bilinfo-row">
            <span class="bilinfo-label">Registreringsnummer:</span>
            <span class="bilinfo-value">${regnr || 'Ikke tilgjengelig'}</span>
          </div>
          <div class="bilinfo-row">
            <span class="bilinfo-label">Merke:</span>
            <span class="bilinfo-value">${bilmerke || 'Ikke tilgjengelig'}</span>
          </div>
          <div class="bilinfo-row">
            <span class="bilinfo-label">Modell:</span>
            <span class="bilinfo-value">${bilmodell || 'Ikke tilgjengelig'}</span>
          </div>
          <div class="bilinfo-row">
            <span class="bilinfo-label">Årsmodell:</span>
            <span class="bilinfo-value">${bilaar || 'Ikke tilgjengelig'}</span>
          </div>
          <div class="bilinfo-row">
            <span class="bilinfo-label">Motor:</span>
            <span class="bilinfo-value">${bilmotor || 'Ikke tilgjengelig'}</span>
          </div>
        </div>
      `;
    } else {
      bilinfoElement.innerHTML = `
        <p>Ingen bilinformasjon tilgjengelig</p>
        <p class="small-note">Dette kan skje hvis cookies er blokkert eller du bruker en annen enhet.</p>
        <button id="manual-bilinfo" class="manual-input-btn">Oppgi bilinformasjon manuelt</button>
      `;
      
      // Legg til lytter for manuell inntasting
      document.getElementById('manual-bilinfo').addEventListener('click', () => this.showManualForm());
    }
  }
  
  // Vis skjema for manuell inntasting
  showManualForm() {
    const bilinfoElement = document.getElementById(this.elementId);
    
    bilinfoElement.innerHTML = `
      <form id="manual-bilinfo-form">
        <div class="form-group">
          <label for="man-regnr">Registreringsnummer:</label>
          <input type="text" id="man-regnr" placeholder="ABC123">
        </div>
        <div class="form-group">
          <label for="man-merke">Bilmerke:</label>
          <input type="text" id="man-merke" placeholder="f.eks. Volvo">
        </div>
        <div class="form-group">
          <label for="man-modell">Modell:</label>
          <input type="text" id="man-modell" placeholder="f.eks. V90">
        </div>
        <div class="form-group">
          <label for="man-aar">Årsmodell:</label>
          <input type="text" id="man-aar" placeholder="f.eks. 2020">
        </div>
        <button type="submit" class="save-bilinfo-btn">Lagre</button>
      </form>
    `;
    
    document.getElementById('manual-bilinfo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Lagre verdiene i localStorage
      const regnr = document.getElementById('man-regnr').value;
      const merke = document.getElementById('man-merke').value;
      const modell = document.getElementById('man-modell').value;
      const aar = document.getElementById('man-aar').value;
      
      if (regnr) localStorage.setItem('bilRegistreringsnummer', regnr);
      if (merke) localStorage.setItem('bilMerke', merke);
      if (modell) localStorage.setItem('bilModell', modell);
      if (aar) localStorage.setItem('bilÅr', aar);
      
      // Oppdater Tawk.to navn hvis tilgjengelig
      if (window.Tawk_API && merke && modell) {
        const bilnavn = `${merke} ${modell}`;
        localStorage.setItem('bilnavn', bilnavn);
        window.Tawk_API.setAttributes({ name: bilnavn }, function(error){});
      }
      
      // Vis bilinformasjonen på nytt
      this.display();
    });
  }
  
  // Hent en enkel oppsummering av bilinformasjon
  getQuickSummary() {
    const bilmerke = localStorage.getItem('bilMerke') || ''; 
    const bilmodell = localStorage.getItem('bilModell') || '';
    const regnr = localStorage.getItem('bilRegistreringsnummer') || '';
    
    return {
      bilmerke,
      bilmodell,
      regnr
    };
  }
}

// Eksporter til globalt scope
window.BilinfoDisplay = BilinfoDisplay;

// Automatisk initialiser hvis det finnes et bilinfo-detaljer element
document.addEventListener('DOMContentLoaded', function() {
  const bilinfoDetaljer = document.getElementById('bilinfo-detaljer');
  if (bilinfoDetaljer) {
    const display = new BilinfoDisplay('bilinfo-detaljer');
    display.display();
  }
});