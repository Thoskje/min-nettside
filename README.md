# bilrådet.no

En online tjeneste for bilrådgivning og betalingsløsninger for bilrelaterte spørsmål.

## Om prosjektet

bilrådet.no er en webapplikasjon som lar brukere få svar på spørsmål om sin bil. Tjenesten kobler brukere med bileksperter gjennom en chat-løsning etter betaling.

### Hovedfunksjoner

- Biloppslag basert på registreringsnummer
- Betalingsbehandling via Stripe
- Live chat med bilrådgivere via Tawk.to
- Responsivt design for alle enheter

## Teknisk struktur

### Frontend
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Responsive design med CSS Grid og Flexbox
- Stripe Elements for betalingsgrensesnitt
- Tawk.to for chat-funksjonalitet

### Backend
- Node.js server med Express
- API-endepunkter for:
  - Biloppslag
  - Betalingsbehandling
  - Sessjonsverifisering
  
### Tredjepartsintegrasjoner
- Stripe for betalingsbehandling
- Tawk.to for kundeservice-chat
- Kjøretøyregister API for bildata

## Installasjon og oppsett

### Forutsetninger
- Node.js (v14.x eller nyere)
- NPM (v6.x eller nyere)
- Stripe-konto og API-nøkler
- Tawk.to-konto

### Installasjonstrinn

1. Klon repository:
```bash
git clone https://github.com/Thoskje/bilradet.git
cd bilradet
```
