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