passord.js

const KODE = "Thoskje";

function sjekkKode() {
  const input = document.getElementById("kodeInput").value.trim();
  const feil = document.getElementById("feilmelding");

  if (input.toLowerCase() === KODE.toLowerCase()) {
    sessionStorage.setItem("godkjent", "ja");
    visInnhold();
  } else {
    feil.textContent = "Feil kode. Prøv igjen.";
  }
}

function visInnhold() {
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("innhold").classList.remove("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("godkjent") === "ja") {
    visInnhold();
  }
});
