document.addEventListener('DOMContentLoaded', function () {
  const regnrInput = document.getElementById('regnr');
  const sokBilBtn = document.getElementById('sok-bil');
  const bilinfoDiv = document.getElementById('bilinfo');

  if (regnrInput && sokBilBtn && bilinfoDiv) {
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
        console.log('Respons fra proxy:', res);
        if (!res.ok) {
          console.error('Nettverksresponsen var ikke ok', res.status, res.statusText);
          throw new Error('Nettverksresponsen var ikke ok');
        }
        const data = await res.json();
        console.log('Data fra proxy:', data);

        // Sjekk begge mulige feltnavn
        const bilListe = data.kjoretoydataListe || data.kjoretoydata;

        if (bilListe && bilListe.length > 0) {
          const bil = bilListe[0];
          console.log('Første bil-objekt:', bil);

          // Hent ut feltene fra objektet
          const merke = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke || '';
          const modell = bil.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0] || '';
          const forstegangsregistrert = bil.forstegangsregistrering?.registrertForstegangNorgeDato || '';

          // Sett brukernavn i Tawk.to-chatten
          if (window.Tawk_API) {
            window.Tawk_API.setAttributes({
              'name': `${merke} ${modell} (${regnr})`
            }, function(error){});
          }

          const regnrUpper = regnr.toUpperCase();
          const bilnavn = `${merke} ${modell} (${regnrUpper})`;
          localStorage.setItem('bilnavn', bilnavn);

          bilinfoDiv.innerHTML = `<strong>Bilmerke:</strong> ${merke}<br>
            <strong>Bilmodell:</strong> ${modell}<br>
            <strong>Førstegangsregistrert:</strong> ${forstegangsregistrert}<br>
            <strong>Registreringsnummer:</strong> ${regnr}<br>`;
        } else {
          console.warn('Ingen informasjon funnet for dette registreringsnummeret.');
          bilinfoDiv.innerHTML = 'Ingen informasjon funnet for dette registreringsnummeret.';
        }
      } catch (e) {
        console.error('Det oppsto en feil:', e);
        alert('Det oppsto en feil under henting av bilinformasjon. Vennligst prøv igjen senere.');
      }
    });
  }
});
fetch(`/api/bil?regnr=${regnr}`)
  .then(res => res.json())
  .then(data => {
    const merke = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke || '';
    const modell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0] || '';
    const regnrUpper = regnr.toUpperCase();
    const arsmodell = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.arsmodell || '';
    const drivstoff = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.drivstoff || '';
    const motortype = data.godkjenning?.tekniskGodkjenning?.tekniskeData?.motor?.[0]?.motortype || '';

    // Lag bilnavn med årsmodell, drivstoff og motortype
    const bilnavn = `${merke} ${modell} ${arsmodell} ${drivstoff} ${motortype} (${regnrUpper})`;
    localStorage.setItem('bilnavn', bilnavn);

    // ...vis bilinfo på siden som før...
    bilinfoDiv.innerHTML = `<strong>Bilmerke:</strong> ${merke}<br>
      <strong>Bilmodell:</strong> ${modell}<br>
      <strong>Årsmodell:</strong> ${arsmodell}<br>
      <strong>Drivstoff:</strong> ${drivstoff}<br>
      <strong>Motortype:</strong> ${motortype}<br>
      <strong>Registreringsnummer:</strong> ${regnrUpper}<br>`;
  });