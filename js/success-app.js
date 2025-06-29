/**  
 * Main application code
 *  * @author  bilrådet.no/TS
 * @version 1.0
 */

/**
 * Payment Verifier - Verifiserer betalingsstatus
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
      
      // Verifiser med API - nå med forbedret respons-format
      const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.paid) {
        // Betaling bekreftet
        localStorage.setItem('betalingsStatus', 'betalt');
        localStorage.setItem('paymentIntentId', data.paymentIntentId || 'unknown');
        localStorage.setItem('customerId', data.customerId || 'unknown');
        if (this.events.onSuccess) this.events.onSuccess();
      } else {
        console.error('Betalingsverifisering feilet:', data.message || 'Ukjent feil');
        if (this.events.onError) this.events.onError();
      }
    } catch (error) {
      console.error('Feil ved verifisering:', error);
      if (this.events.onError) this.events.onError();
    }
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
    // Hent bilinformasjon fra localStorage
    const bilmerke = localStorage.getItem('bilMerke') || '';
    const bilmodell = localStorage.getItem('bilModell') || '';
    const regnr = localStorage.getItem('bilRegistreringsnummer') || '';
    
    const quickBilinfo = document.getElementById(this.infoId);
    
    // Vis bilinfo i modalen
    if (bilmerke || regnr) {
      quickBilinfo.innerHTML = `
        <p><strong>Din bil:</strong> ${bilmerke} ${bilmodell}</p>
        ${regnr ? `<p><strong>Registreringsnummer:</strong> ${regnr}</p>` : ''}
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
  }
  
  // Lukk modal
  close() {
    const modal = document.getElementById(this.modalId);
    
    // Animer ut modalen
    modal.classList.remove('visible');
    
    setTimeout(() => {
      modal.style.display = 'none';
      // Vis hovedinnholdet som flex istedenfor block
      document.getElementById(this.mainContentId).style.display = 'flex';
      
      // Maksimer chatten hvis den er lastet
      if (window.Tawk_API && window.Tawk_API.maximize) {
        window.Tawk_API.maximize();
      }
    }, 300);
  }
}

/**
 * Chat Loader - Håndterer innlasting av Tawk.to chat
 */
class ChatLoader {
  constructor() {
    // Define Tawk API if it doesn't exist
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    
    // Set embedded container ID
    window.Tawk_API.embedded = 'tawk_68148681c915a4190c8c02d6';
    
    // Set onLoad handler
    window.Tawk_API.onLoad = this._onChatLoaded.bind(this);
  }
  
  // Load chat script
  load() {
    // Check if script is already loaded
    if (document.querySelector('script[src*="tawk.to"]')) return;
    
    console.log('Loading Tawk.to chat script');
    
    // Load Tawk.to script
    const script = document.createElement("script");
    script.async = true;
    script.src = 'https://embed.tawk.to/68148681c915a4190c8c02d6/1iu9f7du8';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.head.appendChild(script);
  }
  
  // Handle chat loaded event
  _onChatLoaded() {
    console.log('Tawk.to chat loaded');
    
    // Get car name from localStorage
    const bilnavn = localStorage.getItem('bilnavn');
    if (bilnavn) {
      window.Tawk_API.setAttributes({ name: bilnavn }, function(error){
        if (error) {
          console.error('Feil ved setting av Tawk.to attributter:', error);
        }
      });
    }
    
    // Maximize chat automatically
    window.Tawk_API.maximize();
  }
}

/**
 * Success App - Hovedapplikasjonsklasse
 */
class SuccessApp {
  constructor() {
    // DOM-elementer
    this.errorElement = document.getElementById('payment-error');
    this.errorMessageElement = document.getElementById('error-message'); // Legg til dette i HTML
    this.mainContentElement = document.getElementById('main-content');
    
    // Initialiser moduler
    this.bilinfoDisplay = new BilinfoDisplay('bilinfo-detaljer');
    this.paymentConfirmation = new PaymentConfirmation();
    this.chatLoader = new ChatLoader();
    this.paymentVerifier = new PaymentVerifier();
    
    // Koble hendelser
    this._setupEventListeners();
  }
  
  // Initialiser applikasjonen
  initialize() {
    console.log('Initialiserer success-siden');
    
    // Vis bilinformasjon
    this.bilinfoDisplay.display();
    
    // Verifiser betaling
    this.paymentVerifier.verify();
  }
  
  // Sett opp hendelseshåndterere
  _setupEventListeners() {
    // Håndter vellykket betaling
    this.paymentVerifier.on('onSuccess', () => {
      console.log('Betaling bekreftet');
      
      // Forhåndslast chat-script mens bekreftelsesmodal vises
      this.chatLoader.load();
      
      // Vis betalingsbekreftelsen
      this.paymentConfirmation.show();
    });
    
    // Håndter feil ved betalingsverifisering
    this.paymentVerifier.on('onError', (errorMessage) => {
      console.error('Betaling kunne ikke verifiseres');
      
      // Skjul hovedinnhold og vis feilmelding
      this.mainContentElement.style.display = 'none';
      this.errorElement.style.display = 'block';
      
      // Vis spesifikk feilmelding hvis tilgjengelig
      if (this.errorMessageElement && errorMessage) {
        this.errorMessageElement.textContent = errorMessage;
      }
      
      // Spor feilen for analyse
      if (window.gtag) {
        window.gtag('event', 'payment_verification_error', {
          'event_category': 'payment',
          'event_label': errorMessage || 'Ukjent feil'
        });
      }
    });
  }
}

// Eksporter klasser til globalt scope for eventuell bruk i andre scripts
window.PaymentVerifier = PaymentVerifier;
window.PaymentConfirmation = PaymentConfirmation;
window.ChatLoader = ChatLoader;

// Initialiser applikasjonen når dokumentet er lastet
document.addEventListener('DOMContentLoaded', () => {
  const app = new SuccessApp();
  app.initialize();
});
