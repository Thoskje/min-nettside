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

/**
 * Payment Confirmation - Håndterer betalingsbekreftelsesmodalen
 */
class PaymentConfirmation {
  constructor() {
    this.modalId = 'betalingsbekreftelse-modal';
    this.infoId = 'quick-bilinfo';
    this.buttonId = 'continue-to-chat';
    this.mainContentId = 'main-content';
    
    // Opprett modal hvis den ikke finnes
    this._createModalIfNeeded();
    
    // Legg til hendelseshåndterere
    document.getElementById(this.buttonId).addEventListener('click', () => this.close());
  }
  
  // Opprett modal-struktur
  _createModalIfNeeded() {
    if (document.getElementById(this.modalId)) return;
    
    const modalHtml = `
      <div id="${this.modalId}" class="modal-overlay" style="display: none;">
        <div class="modal-content payment-confirmation">
          <div class="modal-header">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Betaling bekreftet</h2>
          </div>
          <div class="modal-body">
            <p>Takk for din betaling! Vi er klar til å hjelpe deg med spørsmål om din bil.</p>
            
            <!-- Bilinfo oppsummering -->
            <div class="quick-bilinfo" id="${this.infoId}">
              <!-- Enkel bilinfo fylles inn via JavaScript -->
            </div>
          </div>
          <div class="modal-footer">
            <button id="${this.buttonId}" class="primary-button">Gå til chatten</button>
          </div>
        </div>
      </div>
    `;
    
    // Legg til modalen i DOM
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHtml;
    document.body.appendChild(tempDiv.firstElementChild);
  }
  
  // Vis modal
  show() {
    // Hent bilinformasjon for modalen
    const bilinfoDisplay = new window.BilinfoDisplay('bilinfo-detaljer');
    const bilinfo = bilinfoDisplay.getQuickSummary();
    const quickBilinfo = document.getElementById(this.infoId);
    
    // Vis bilinfo i modalen
    if (bilinfo.bilmerke || bilinfo.regnr) {
      quickBilinfo.innerHTML = `
        <p><strong>Din bil:</strong> ${bilinfo.bilmerke} ${bilinfo.bilmodell}</p>
        ${bilinfo.regnr ? `<p><strong>Registreringsnummer:</strong> ${bilinfo.regnr}</p>` : ''}
      `;
    } else {
      quickBilinfo.innerHTML = `<p>Du kan stille spørsmål om din bil i chatten.</p>`;
    }
    
    // Vis modalen med animasjon
    const modal = document.getElementById(this.modalId);
    modal.style.display = 'flex';
    
    // Trigger reflow for å sikre at animasjonen kjører
    void modal.offsetWidth;
    
    setTimeout(() => {
      modal.classList.add('visible');
    }, 10);
    
    // Preload Tawk.to scriptet
    this._preloadTawkScript();
  }
  
  // Lukk modal
  close() {
    const modal = document.getElementById(this.modalId);
    
    // Animer ut modalen
    modal.classList.remove('visible');
    
    setTimeout(() => {
      modal.style.display = 'none';
      // Vis hovedinnholdet
      document.getElementById(this.mainContentId).style.display = 'block';
      
      // Maksimer chatten hvis den er lastet
      if (window.Tawk_API && window.Tawk_API.maximize) {
        window.Tawk_API.maximize();
      }
    }, 300);
  }
  
  // Preload Tawk.to script
  _preloadTawkScript() {
    // Sjekk om script allerede er lastet
    if (document.querySelector('script[src*="tawk.to"]')) return;
    
    // Last inn Tawk.to script på forhånd for raskere oppstart
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/68148681c915a4190c8c02d6/1iu9f7du8';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.head.appendChild(s1);
  }
}

/**
 * Payment Verification - Verifiserer betalingsstatus
 */
class PaymentVerifier {
  constructor() {
    // Eventstyring
    this.events = {
      onSuccess: null,
      onError: null
    };
  }
  
  // Registrer hendelseshåndterere
  on(event, callback) {
    if (this.events.hasOwnProperty(event)) {
      this.events[event] = callback;
    }
    return this;
  }
  
  // Utfør verifisering
  async verify() {
    try {
      // Sjekk om vi har en session_id i URL
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id') || localStorage.getItem('sessionId');
      
      if (!sessionId) {
        // Ingen session ID, men la oss sjekke om vi har en lokal betalingsstatus
        if (localStorage.getItem('betalingsStatus') === 'betalt') {
          if (this.events.onSuccess) this.events.onSuccess();
          return;
        }
        
        // Ingen betaling funnet
        if (this.events.onError) this.events.onError();
        return;
      }
      
      // Verifiser med API
      const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.paid) {
        // Betaling bekreftet
        localStorage.setItem('betalingsStatus', 'betalt');
        localStorage.setItem('paymentIntentId', data.paymentIntentId || 'unknown');
        if (this.events.onSuccess) this.events.onSuccess();
      } else {
        if (this.events.onError) this.events.onError();
      }
    } catch (error) {
      console.error('Feil ved verifisering:', error);
      if (this.events.onError) this.events.onError();
    }
  }
}

// Eksporter til globalt scope
window.BilinfoDisplay = BilinfoDisplay;
window.PaymentConfirmation = PaymentConfirmation;
window.PaymentVerifier = PaymentVerifier;