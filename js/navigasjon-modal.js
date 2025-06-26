/**
 * Navigasjonsmodal - Bekrefter før brukeren forlater chat-siden
 * Fanger opp nettleserens tilbakeknapp og klikk på navigasjonslenker
 */
document.addEventListener('DOMContentLoaded', function() {
  // Først, legg til CSS-stiler
  injectNavigationModalCSS();
  
  // Sjekk om brukeren har betalt (basert på localStorage)
  const hasValidPayment = 
    localStorage.getItem('betalingsStatus') === 'betalt' && 
    localStorage.getItem('paymentIntentId');

  if (hasValidPayment) {
    // Variabler for historikkhåndtering
    const currentUrl = window.location.href;
    let historyInitialized = false;
    
    // Initialiser historikktilstandene umiddelbart
    initHistory();
    
    // Funksjon for å sette opp historikktilstander
    function initHistory() {
      if (historyInitialized) return;
      
      // Første dummy-state - denne vil bli popped ved første tilbakeklikk
      history.pushState({ page: 'chat-entry', id: 1 }, document.title, currentUrl);
      console.log('Navigation protection: Added first history state');
      
      // Legg til neste state etter en kort forsinkelse
      // Dette hjelper noen nettlesere med å registrere tilstandene separat
      setTimeout(() => {
        // Andre dummy-state - denne vil vise modalen når den poppes
        history.pushState({ page: 'chat-active', id: 2 }, document.title, currentUrl);
        console.log('Navigation protection: Added second history state');
        historyInitialized = true;
      }, 100);
    }

    // 1. Advarsel ved forsøk på å forlate siden/lukke fanen
    window.addEventListener('beforeunload', function(e) {
      const confirmationMessage = 'Du er i ferd med å forlate chatten.';
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    });
    
    // 2. Håndter nettleserens tilbakeknapp med History API
    window.addEventListener('popstate', function(event) {
      console.log('Navigation protection: Popstate triggered', event.state);
      
      // Vis modalen når brukeren klikker tilbake
      showNavigationModal(document.referrer || '/');
      
      // Viktig: Legg til ny state umiddelbart
      history.pushState({ page: 'chat-active', id: Math.random() }, document.title, currentUrl);
      console.log('Navigation protection: Added replacement history state');
    });

    // 3. Fang opp klikk på logoer og lenker
    document.addEventListener('click', function(e) {
      // Finn nærmeste a-tag hvis brukeren klikket på et underelement
      const clickedLink = e.target.closest('a');
      
      if (!clickedLink) return;
      
      // Sjekk om lenken går til hjemmesiden eller utenfor nåværende side
      const href = clickedLink.getAttribute('href') || '';
      const isHomeLink = href === '/' || 
                        href === 'index.html' || 
                        href === '#' ||
                        href.startsWith('http');
      
      // Hvis brukeren klikker på en navigasjonslenke
      if (isHomeLink && !clickedLink.classList.contains('no-confirm')) {
        e.preventDefault(); // Stopp standard navigering
        showNavigationModal(href);
      }
    });

    /**
     * Funksjon for å vise app-lignende modal
     * @param {string} targetUrl - URL som brukeren forsøker å navigere til
     */
    function showNavigationModal(targetUrl) {
      console.log('Navigation protection: Showing modal for', targetUrl);
      
      // Oprydning: Fjern eksisterende modaler (i tilfelle en henger igjen)
      const existingModal = document.querySelector('.app-modal-container');
      if (existingModal) {
        document.body.removeChild(existingModal);
      }
      
      // Opprett modal container
      const modalContainer = document.createElement('div');
      modalContainer.className = 'app-modal-container';
      modalContainer.style.zIndex = '2147483647'; // Maksimal z-index
      
      // Lag modal dialog
      const modal = document.createElement('div');
      modal.className = 'app-modal';
      modal.style.zIndex = '2147483647'; // Maksimal z-index
      modal.innerHTML = `
        <div class="app-modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2>Avslutt samtalen?</h2>
        <p>Hvis du forlater denne siden vil du miste tilgangen til samtalen du har betalt for.</p>
        <div class="app-modal-buttons">
          <button class="cancel-btn">Bli i chatten</button>
          <button class="confirm-btn">Forlat siden</button>
        </div>
      `;
      
      // Legg til modal i container
      modalContainer.appendChild(modal);
      
      // Legg til container i body
      document.body.appendChild(modalContainer);
      document.body.classList.add('has-modal');
      
      // Vis modal umiddelbart (ingen forsinkelse)
      requestAnimationFrame(() => {
        modalContainer.classList.add('visible');
        modal.classList.add('visible');
      });
      
      // Legg til hendelseshåndterere
      const cancelButton = modal.querySelector('.cancel-btn');
      const confirmButton = modal.querySelector('.confirm-btn');
      
      // Kanseller navigering
      cancelButton.addEventListener('click', function() {
        closeModal();
      });
      
      // Bekreft navigering
      confirmButton.addEventListener('click', function() {
        closeModal(true);
        window.location.href = targetUrl;
      });
      
      // Klikk utenfor for å lukke
      modalContainer.addEventListener('click', function(e) {
        if (e.target === modalContainer) {
          closeModal();
        }
      });
      
      // Funksjon for å lukke modal med animasjon
      function closeModal(navigate) {
        modal.classList.remove('visible');
        modalContainer.classList.remove('visible');
        document.body.classList.remove('has-modal');
        
        setTimeout(() => {
          if (document.body.contains(modalContainer)) {
            document.body.removeChild(modalContainer);
          }
        }, 300);
      }
    }
    
    // Reinitaliser historikktilstandene ved interaksjon for å sikre konstant beskyttelse
    document.addEventListener('click', function() {
      if (!historyInitialized) {
        initHistory();
      }
    });
    
    // Sjekk om nettleseren støtter History API korrekt
    if (window.navigator.userAgent.indexOf('MSIE ') > -1 || 
        window.navigator.userAgent.indexOf('Trident/') > -1) {
      console.log('IE detected, using fallback history protection');
      
      // IE fallback - sjekk regelmessig om brukeren forsøker å gå tilbake
      setInterval(function() {
        if (document.visibilityState === 'hidden') {
          // Brukeren kan ha forsøkt å navigere bort
          document.addEventListener('visibilitychange', function onVisibilityChange() {
            if (document.visibilityState === 'visible') {
              showNavigationModal('/');
              document.removeEventListener('visibilitychange', onVisibilityChange);
            }
          });
        }
      }, 500);
    }
  }
  
  /**
   * Funksjon for å injisere CSS-stiler for navigasjonsmodalen
   * Dette eliminerer behovet for en separat CSS-fil
   */
  function injectNavigationModalCSS() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* Modal container */
      .app-modal-container {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483647 !important; /* Maximum z-index */
        transition: background-color 0.3s ease;
        backdrop-filter: blur(0px);
      }

      .app-modal-container.visible {
        background-color: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(5px);
      }

      /* Modal dialog */
      .app-modal {
        background: #ffffff;
        width: 90%;
        max-width: 380px;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        padding: 28px;
        transform: scale(0.95);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        text-align: center;
        position: relative;
        z-index: 2147483647 !important; /* Same maximum z-index */
      }

      .app-modal.visible {
        transform: scale(1);
        opacity: 1;
      }

      /* Warning icon */
      .app-modal-icon {
        margin-bottom: 16px;
        color: #3b82f6;
        display: flex;
        justify-content: center;
      }

      /* Modal heading */
      .app-modal h2 {
        color: #1e293b;
        font-size: 1.5rem;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.2;
      }

      /* Modal body text */
      .app-modal p {
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 24px;
      }

      /* Button container */
      .app-modal-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Base button styles */
      .app-modal-buttons button {
        padding: 14px 20px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;
        width: 100%;
      }

      /* Cancel button - stays in chat */
      .app-modal-buttons .cancel-btn {
        background: #f1f5f9;
        color: #0f172a;
      }

      .app-modal-buttons .cancel-btn:hover {
        background: #e2e8f0;
      }

      .app-modal-buttons .cancel-btn:active {
        transform: translateY(1px);
        background: #cbd5e1;
      }

      /* Confirm button - leaves chat */
      .app-modal-buttons .confirm-btn {
        background: #ef4444;
        color: white;
      }

      .app-modal-buttons .confirm-btn:hover {
        background: #dc2626;
      }

      .app-modal-buttons .confirm-btn:active {
        transform: translateY(1px);
        background: #b91c1c;
      }

      /* Responsive styles */
      @media (min-width: 640px) {
        .app-modal-buttons {
          flex-direction: row;
        }
        
        .app-modal-buttons button {
          flex: 1;
        }
      }

      /* Ensure modal is always on top of Tawk.to and other high z-index elements */
      body.has-modal iframe[title*="chat" i],
      body.has-modal .Tawk_ChatFrameContainer,
      body.has-modal #tawkchat-container,
      body.has-modal #tawkchat-minified-wrapper {
        z-index: 1000000 !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
});

