import express from 'express';

const app = express();
const API_KEY = 'Apikey 036d17d4-e6c6-4187-997a-bfe0dbe78830'; // NB! Prefix "Apikey " foran nøkkelen

app.get('/api/bil/:regnr', async (req, res) => {
  const regnr = req.params.regnr.toUpperCase();
  const apiUrl = `https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata?kjennemerke=${regnr}`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'SVV-Authorization': API_KEY,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Feil fra Vegvesen:', errorText);
      res.status(response.status).json({ error: errorText });
      return;
    }
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (e) {
    console.error('Feil i proxy:', e);
    res.status(500).json({ error: 'Feil ved oppslag' });
  }
});

app.listen(3100, () => console.log('Proxy kjører på http://localhost:3100'));