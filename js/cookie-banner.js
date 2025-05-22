document.addEventListener('DOMContentLoaded', function () {
  const banner = document.getElementById('cookie-banner');
  const acceptButton = document.getElementById('accept-cookies');
  const rejectButton = document.getElementById('reject-cookies');
  const manageButton = document.getElementById('manage-cookies');
  const modal = document.getElementById('cookie-settings-modal');
  const closeSettings = document.getElementById('close-settings');
  const form = document.getElementById('cookie-settings-form');

  // Funksjon for å laste Google Analytics kun hvis analytics er godtatt
  function loadGoogleAnalytics() {
    if (window.gaLoaded) return;
    window.gaLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'; // <-- Bytt ut med din GA-ID
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX'); // <-- Bytt ut med din GA-ID
  }

  // Sjekk om vi skal vise banneret
  const urlParams = new URLSearchParams(window.location.search);
  const forceShow = urlParams.get('cookies') === 'show';

  if (!localStorage.getItem('cookiePreferences') || forceShow) {
    banner.style.display = 'block';
  }

  // Godta alle
  acceptButton.addEventListener('click', function () {
    const preferences = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    banner.style.display = 'none';
    loadGoogleAnalytics();
  });

  // Avslå
  rejectButton.addEventListener('click', function () {
    const preferences = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    banner.style.display = 'none';
  });

  // Administrer cookies
  manageButton.addEventListener('click', function () {
    modal.style.display = 'block';
  });

  closeSettings.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  // Lagre valg fra modal
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const preferences = {
      necessary: true,
      analytics: form.querySelector('input[name="analytics"]').checked,
      marketing: form.querySelector('input[name="marketing"]').checked,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    modal.style.display = 'none';
    banner.style.display = 'none';
    if (preferences.analytics) {
      loadGoogleAnalytics();
    }
  });

  // Last inn Google Analytics hvis bruker allerede har godtatt analytics
  const prefs = JSON.parse(localStorage.getItem('cookiePreferences') || '{}');
  if (prefs.analytics) {
    loadGoogleAnalytics();
  }
});
