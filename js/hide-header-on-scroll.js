document.addEventListener("DOMContentLoaded", function () {
  console.log("hide-header-on-scroll.js loaded");
  let lastScroll = 0;
  const header = document.querySelector('header');
  if (!header) {
    console.log("Fant ikke <header>!");
    return;
  }

  window.addEventListener('scroll', function () {
    console.log("Scroll event fired!");
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    // For feilsøking:
    // console.log("Scroll:", currentScroll, "Last:", lastScroll);
    if (currentScroll > lastScroll && currentScroll > 80) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;
  });
});