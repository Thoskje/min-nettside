/**
 * Bilinfo og betaling widget
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Widget script loaded');
  
  // ============= DOM-elementer =============
  const widgetOverlay = document.getElementById('bilinfobetaling-overlay');
  const closeBtn = document.getElementById('widget-close');
  const cancelBtn = document.getElementById('widget-cancel');
  
  // Steg 1: Bilinfo
  const regnrInput = document.getElementById('widget-regnr');
  const sokBtn = document.getElementById('widget-sok-bil');
  const bilinfoDiv = document.getElementById('widget-bilinfo');
  const godkjennBtn = document.getElementById('widget-godkjenn');
  
  // Steg 2: Betaling
  const bilDisplay = document.getElementById('widget-bil-display');
  const paymentForm = document.getElementById('widget-payment-form');
  const paymentError = document.getElementById('widget-payment-error');
  const backBtn = document.getElementById('widget-back');
  const betalBtn = document.getElementById('widget-betal');
  
  // Steg 3: Chat
  const startChatBtn = document.getElementById('widget-start-chat');
  
  // Steg-elementer
  const stepElements = document.querySelectorAll('.step');
  const stepContents = document.querySelectorAll('.step-content');
  
  // ============= Stripe-oppsett (ERSTATT HELE SEKSJONEN) =============
  let stripe, elements, paymentElement;
  let stripeInitialized = false;
  
  // FØRSTE JS-KODE: initStripe-funksjonen
  function initStripe() {
    if (stripeInitialized) return;
    
    try {
      stripe = Stripe('pk_test_51RRgZNElNLQwLfbumd8AOKSjDYgs1O3uL1FiHamyNTSArSUW1gRgtVwD70TFKPrJmNvZfpOBVd9emY8Vyyo7HKSX00cp7qONI0');
      
      // VIKTIG: Legg til paymentMethodCreation: 'manual'
      elements = stripe.elements({
        mode: 'payment',
        amount: 24900,
        currency: 'nok',
        paymentMethodCreation: 'manual', // Dette var det som manglet!
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#635BFF',
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            colorDanger: '#e74c3c',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSizeBase: '16px',
            borderRadius: '8px',
            spacingUnit: '4px'
          },
          rules: {
            '.Tab': {
              border: '1px solid #e0e0e0',
              padding: '16px 20px',
              backgroundColor: '#ffffff'
            },
            '.Tab--selected': {
              backgroundColor: '#f8f9ff',
              borderColor: '#635BFF'
            },
            '.Input': {
              border: '1px solid #d0d0d0',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '16px'
            },
            '.Input:focus': {
              borderColor: '#635BFF',
              boxShadow: '0 0 0 3px rgba(99, 91, 255, 0.1)'
            }
          }
        }
      });
      
      // Opprett Payment Element (kun kort for å unngå problemer)
      paymentElement = elements.create('payment', {
        layout: {
          type: 'tabs'
        },
        paymentMethodOrder: ['card'],
        fields: {
          billingDetails: {
            address: {
              country: 'never' // Skjul land-felt
            }
          }
        }
      });
      
      paymentElement.mount('#widget-payment-element');
      
      // Event listeners
      paymentElement.on('change', function(event) {
        if (event.error) {
          paymentError.textContent = event.error.message;
        } else {
          paymentError.textContent = '';
        }
      });
      
      stripeInitialized = true;
      console.log('Stripe Payment Element initialized with manual payment method creation');
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      paymentError.textContent = 'Kunne ikke laste betalingsløsning';
    }
  }
  
  // ============= Widget-navigering (EKSISTERENDE KODE) =============
  const widget = {
    currentStep: 1,
    
    goToStep: function(step) {
      stepContents.forEach(content => content.classList.remove('active'));
      stepElements.forEach(step => step.classList.remove('active', 'completed'));
      
      document.getElementById(`step-${step}`).classList.add('active');
      
      stepElements.forEach(el => {
        const stepNum = parseInt(el.dataset.step);
        if (stepNum < step) {
          el.classList.add('completed');
        } else if (stepNum === step) {
          el.classList.add('active');
        }
      });
      
      this.currentStep = step;
      
      if (step === 2 && !stripeInitialized) {
        initStripe();
        this.updatePaymentDisplay();
      }
    },
    
    updatePaymentDisplay: function() {
      if (!bilDisplay) return;
      
      const bilMerke = localStorage.getItem('bilMerke') || '';
      const bilModell = localStorage.getItem('bilModell') || '';
      const regnr = localStorage.getItem('bilRegistreringsnummer') || '';
      const bilAr = localStorage.getItem('bilÅr') || '';
      
      bilDisplay.innerHTML = `
        <div class="widget-bil-display">
          <p>${bilMerke} ${bilModell} ${bilAr}</p>
        </div>
      `;
    },
    
    open: function() {
      widgetOverlay.style.display = 'flex';
      this.goToStep(1);
      
      regnrInput.value = '';
      bilinfoDiv.innerHTML = '';
      godkjennBtn.style.display = 'none';
      paymentError.textContent = '';
    },
    
    close: function() {
      widgetOverlay.style.display = 'none';
    }
  };
  
  // ============= Event Listeners (EKSISTERENDE KODE) =============
  
  // Åpne widget
  document.querySelectorAll('.chat-btn, .cta-button').forEach(btn => {
    if (btn && !btn.classList.contains('kurs-btn')) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        widget.open();
      });
    }
  });
  
  // Lukkeknapper
  if (closeBtn) closeBtn.addEventListener('click', () => widget.close());
  if (cancelBtn) cancelBtn.addEventListener('click', () => widget.close());
  
  // Lukk ved klikk utenfor modal
  widgetOverlay.addEventListener('click', function(e) {
    if (e.target === widgetOverlay) widget.close();
  });
  
  // ============= BILINFO med detaljert visning =============
  if (sokBtn && regnrInput) {
    sokBtn.addEventListener('click', async function() {
      const regnr = regnrInput.value.trim().toUpperCase();
      
      if (!regnr) {
        alert('Vennligst skriv inn et registreringsnummer.');
        return;
      }
      
      bilinfoDiv.innerHTML = '<div class="loader">Søker...</div>';
      godkjennBtn.style.display = 'none';
      
      try {
        const url = `/api/bil?regnr=${encodeURIComponent(regnr)}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Korrekt parsing basert på faktisk API-struktur
        const bilListe = data.kjoretoydataListe || [data];
        let merke = '';
        let modell = '';
        let arsmodell = '';
        let drivstoff = '';
        let motortype = '';
        let forstegangsregistrert = '';

        if (bilListe && bilListe.length > 0) {
          const bil = bilListe[0];
          
          // Hent tekniske data
          const tekniskeData = bil.godkjenning?.tekniskGodkjenning?.tekniskeData;
          
          if (tekniskeData) {
            // Merke og modell
            const generelt = tekniskeData.generelt;
            if (generelt) {
              merke = generelt.merke?.[0]?.merke || '';
              modell = generelt.handelsbetegnelse?.[0] || '';
            }
            
            // Motor og drivstoff
            const motor = tekniskeData.motorOgDrivverk?.motor?.[0];
            if (motor) {
              motortype = motor.motorKode || '';
              // Drivstoff fra motor-seksjonen
              drivstoff = motor.drivstoff?.[0]?.drivstoffKode?.kodeBeskrivelse || '';
            }
            
            // Alternativ drivstoff fra miljødata
            if (!drivstoff) {
              const miljodata = tekniskeData.miljodata?.miljoOgdrivstoffGruppe?.[0];
              drivstoff = miljodata?.drivstoffKodeMiljodata?.kodeBeskrivelse || '';
            }
          }
          
          // Førstegangsregistrering
          forstegangsregistrert = bil.forstegangsregistrering?.registrertForstegangNorgeDato || '';
          
          // Utled årsmodell fra førstegangsregistrering
          if (forstegangsregistrert) {
            arsmodell = forstegangsregistrert.substring(0, 4);
          }
          
          // Alternativt fra godkjenning
          if (!arsmodell) {
            const godkjenningDato = bil.godkjenning?.tekniskGodkjenning?.gyldigFraDato;
            if (godkjenningDato) {
              arsmodell = godkjenningDato.substring(0, 4);
            }
          }
        }

        console.log('Parsed bildata:', { merke, modell, arsmodell, drivstoff, motortype, forstegangsregistrert });

        if (merke || modell) {
          // Lagre data i localStorage
          const bilnavn = `${merke} ${modell} ${arsmodell} ${drivstoff} ${motortype} (${regnr})`;
          localStorage.setItem('bilnavn', bilnavn);
          localStorage.setItem('bilRegistreringsnummer', regnr);
          localStorage.setItem('bilMerke', merke);
          localStorage.setItem('bilModell', modell);
          localStorage.setItem('bilÅr', arsmodell);
          localStorage.setItem('bilMotor', `${drivstoff} ${motortype}`.trim());
          
          // Vis kun felter med innhold
          let bilinfoHTML = '<div class="bil-info">';
          
          if (merke) bilinfoHTML += `<strong>Bilmerke:</strong> ${merke}<br>`;
          if (modell) bilinfoHTML += `<strong>Bilmodell:</strong> ${modell}<br>`;
          if (forstegangsregistrert) bilinfoHTML += `<strong>Førstegangsregistrert:</strong> ${forstegangsregistrert}<br>`;
          if (arsmodell) bilinfoHTML += `<strong>Årsmodell:</strong> ${arsmodell}<br>`;
          if (drivstoff) bilinfoHTML += `<strong>Drivstoff:</strong> ${drivstoff}<br>`;
          if (motortype) bilinfoHTML += `<strong>Motortype:</strong> ${motortype}<br>`;
          bilinfoHTML += `<strong>Registreringsnummer:</strong> ${regnr}</div>`;
          
          bilinfoDiv.innerHTML = bilinfoHTML;
          
          godkjennBtn.style.display = 'block';
          
          // Oppdater Tawk.to
          if (window.Tawk_API) {
            window.Tawk_API.setAttributes({
              'name': `${merke} ${modell} ${drivstoff} ${motortype} (${regnr})`
            }, function(error){});
          }
        } else {
          bilinfoDiv.innerHTML = '<p class="error">Ingen informasjon funnet for dette registreringsnummeret.</p>';
          godkjennBtn.style.display = 'none';
        }
      } catch (error) {
        console.error('Error fetching car data:', error);
        bilinfoDiv.innerHTML = `<p class="error">Det oppsto en feil under søk. Vennligst prøv igjen.</p>`;
        godkjennBtn.style.display = 'none';
      }
    });
  }
  
  // Godkjenn bil og gå til betaling
  if (godkjennBtn) {
    godkjennBtn.addEventListener('click', function() {
      widget.goToStep(2);
    });
  }
  
  // Tilbake til bilinfo
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      widget.goToStep(1);
    });
  }
  
  // ============= BETALING (ANDRE JS-KODE - ERSTATT EKSISTERENDE) =============
  if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const betalBtn = document.getElementById('widget-betal');
      betalBtn.disabled = true;
      betalBtn.textContent = 'Behandler...';
      paymentError.textContent = '';
      
      try {
        // 1. Submit elements først
        const { error: submitError } = await elements.submit();
        
        if (submitError) {
          throw submitError;
        }
        
        // 2. Opprett Payment Method (nå fungerer det med manual mode)
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          elements,
          params: {
            billing_details: {
              name: 'Test Bruker'
            }
          }
        });
        
        if (pmError) {
          throw pmError;
        }
        
        console.log('Payment Method created successfully:', paymentMethod);
        
        // 3. For testing: Simuler vellykket betaling
        localStorage.setItem('betalingsStatus', 'betalt');
        localStorage.setItem('paymentMethodId', paymentMethod.id);
        
        // 4. Gå til chat-steg
        betalBtn.textContent = 'Betaling godkjent!';
        setTimeout(() => {
          widget.goToStep(3);
        }, 1000);
        
      } catch (error) {
        console.error('Payment error:', error);
        
        // Vis spesifikk feilmelding
        if (error.type === 'card_error') {
          paymentError.textContent = error.message;
        } else if (error.type === 'validation_error') {
          paymentError.textContent = 'Vennligst fyll ut alle kortopplysninger';
        } else {
          paymentError.textContent = 'Det oppsto en feil. Prøv igjen.';
        }
        
        // Reaktiver knapp
        betalBtn.disabled = false;
        betalBtn.textContent = 'Betal 249 kr';
      }
    });
  }
  
  // ============= CHAT =============
  if (startChatBtn) {
    startChatBtn.addEventListener('click', function() {
      widget.close();
      
      if (window.Tawk_API) {
        window.Tawk_API.toggle();
      } else if (window.FrontChat) {
        window.FrontChat('show');
      } else {
        window.location.href = '/success.html';
      }
    });
  }
  
  // Registreringsnummer validering
  if (regnrInput) {
    regnrInput.addEventListener('input', function() {
      this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
  }
});