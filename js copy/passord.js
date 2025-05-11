document.addEventListener('DOMContentLoaded', function () {
    let password = "Thoskje"; // Endre til ditt ønskede passord
    let userInput = prompt("Vennligst skriv inn passord for tilgang:");
  
    if (userInput !== password) {
      alert("Feil passord. Tilgang nektet.");
      window.location.href = "https://google.com"; // Omdiriger brukeren hvis passordet er feil
    }
  });
  