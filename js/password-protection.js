document.addEventListener('DOMContentLoaded', function () {
  const banner = document.getElementById('cookie-banner');
  const acceptButton = document.getElementById('accept-cookies');
  const rejectButton = document.getElementById('reject-cookies');
  const manageButton = document.getElementById('manage-cookies');
  const modal = document.getElementById('cookie-settings-modal');
  const closeSettings = document.getElementById('close-settings');
  const form = document.getElementById('cookie-settings-form');

  const urlParams = new URLSearchParams(window.location.search);
  const forceShow = urlParams.get('cookies') === 'show';

  if (!localStorage.getItem('cookiePreferences') || forceShow) {
    banner.style.display = 'block';
  }

  acceptButton.addEventListener('click', function () {
    localStorage.setItem('cookiePreferences', 'accepted');
    banner.style.display = 'none';
  });

  rejectButton.addEventListener('click', function () {
    localStorage.setItem('cookiePreferences', 'rejected');
    banner.style.display = 'none';
  });

  manageButton.addEventListener('click', function () {
    modal.style.display = 'block';
  });

  closeSettings.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const preferences = {
      functional: form.querySelector('input[name="functional"]:checked').value === 'true',
      analytics: form.querySelector('input[name="analytics"]:checked').value === 'true',
    };

    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    modal.style.display = 'none';
  });
});
