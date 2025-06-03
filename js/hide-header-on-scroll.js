document.addEventListener("DOMContentLoaded", function () {
  console.log("hide-header-on-scroll.js loaded");
  let lastScroll = window.pageYOffset || document.documentElement.scrollTop;
  const header = document.querySelector('header');
  const deadzone = 20; // hvor mye du må scrolle før headeren skjules/vises

  if (!header) {
    console.log("Fant ikke <header>!");
    return;
  }

  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Vis alltid header hvis du er helt øverst
    if (currentScroll <= 0) {
      header.style.transform = 'translateY(0)';
    } else if (currentScroll > lastScroll + deadzone && currentScroll > 120) {
      // Scroller ned, og har passert deadzone og 120px
      header.style.transform = 'translateY(-100%)';
      lastScroll = currentScroll;
    } else if (currentScroll < lastScroll - deadzone) {
      // Scroller opp, og har passert deadzone
      header.style.transform = 'translateY(0)';
      lastScroll = currentScroll;
    }
  });
});