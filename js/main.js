console.log("main.js lastet");

document.querySelectorAll('.accordion-header').forEach(function(header) {
  header.addEventListener('click', function() {
    const body = this.nextElementSibling;
    body.classList.toggle('active');
  });
});