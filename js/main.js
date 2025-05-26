console.log("main.js lastet");

document.querySelectorAll('.accordion-header').forEach(function(header) {
  header.addEventListener('click', function() {
    const body = this.nextElementSibling;
    body.classList.toggle('active');
  });
});

const avtalBtn = document.querySelector('.hero-knapper .avtal-btn');
const chatBtn = document.querySelector('.hero-knapper .chat-btn');

if (avtalBtn && chatBtn) {
  avtalBtn.addEventListener('mouseenter', () => {
    chatBtn.style.background = '#0c1a2a';
    avtalBtn.style.background = '#ff9900';
  });
  avtalBtn.addEventListener('mouseleave', () => {
    chatBtn.style.background = '#ff9900';
    avtalBtn.style.background = '#0c1a2a';
  });
}