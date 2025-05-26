document.addEventListener('DOMContentLoaded', function () {
  const banner = document.getElementById('cookie-banner');
  const acceptButton = document.getElementById('accept-cookies');
  const rejectButton = document.getElementById('reject-cookies');
  const manageButton = document.getElementById('manage-cookies');
  const modal = document.getElementById('cookie-settings-modal');
  const closeSettings = document.getElementById('close-settings');
  const form = document.getElementById('cookie-settings-form');

  // Sjekk om vi skal vise banneret
  let prefs = null;
  try {
    prefs = JSON.parse(localStorage.getItem('cookiePreferences'));
  } catch(e) {
    prefs = null;
  }
  const forceShow = new URLSearchParams(window.location.search).get('cookies') === 'show';

  if (!prefs || typeof prefs !== 'object' || forceShow) {
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
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
    // Fjern ?cookies=show fra URL
    if (window.location.search.includes('cookies=show')) {
      const url = new URL(window.location);
      url.searchParams.delete('cookies');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  });

  // Avslå alle unntatt nødvendige
  rejectButton.addEventListener('click', function () {
    const preferences = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    banner.style.display = 'none';
  });

  // Åpne innstillinger
  manageButton.addEventListener('click', function () {
    modal.style.display = 'block';
  });

  // Lukk innstillinger
  closeSettings.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  // Lagre innstillinger fra modal
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const analytics = form.elements['analytics'].checked;
    const marketing = form.elements['marketing'].checked;
    const preferences = {
      necessary: true,
      analytics,
      marketing
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    modal.style.display = 'none';
    banner.style.display = 'none';
  });

  // Fjern ?cookies=show fra URL etter valg
  if (window.location.search.includes('cookies=show')) {
    const url = new URL(window.location);
    url.searchParams.delete('cookies');
    window.history.replaceState({}, '', url.pathname + url.search);
  }
});
