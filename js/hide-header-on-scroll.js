document.addEventListener("DOMContentLoaded", function () {
  let lastScroll = 0;
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > lastScroll && currentScroll > 80) {
      // Scroller ned
      header.style.transform = 'translateY(-100%)';
    } else {
      // Scroller opp
      header.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;
  });
});