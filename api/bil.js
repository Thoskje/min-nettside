export default async function handler(req, res) {
  const { regnr } = req.query;
  const API_KEY = process.env.SVV_API_KEY;
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
    
    // DEBUG: Logg rådata fra SVV
    console.log('SVV API Response for', regnr, ':', JSON.stringify(data, null, 2));
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (e) {
    console.error('API Error:', e);
    res.status(500).json({ error: 'Feil ved oppslag' });
  }
}