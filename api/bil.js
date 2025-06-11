export default async function handler(req, res) {
  const { regnr } = req.query;
<<<<<<< HEAD
  const API_KEY = process.env.SVV_API_KEY;
=======
  const API_KEY = 'Apikey 036d17d4-e6c6-4187-997a-bfe0dbe78830';
>>>>>>> 5e3e4cef6148a13ee26fd45ed3a5cc9d62c16f86
  const apiUrl = `https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata?kjennemerke=${regnr.toUpperCase()}`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'SVV-Authorization': API_KEY,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
      return;
    }
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Feil ved oppslag' });
  }
}