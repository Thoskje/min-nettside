export default async function handler(req, res) {
  const { regnr } = req.query;
  
  if (!regnr) {
    return res.status(400).json({ error: 'Registreringsnummer mangler' });
  }
  
  const API_KEY = process.env.SVV_API_KEY;
  const apiUrl = `https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata?kjennemerke=${regnr.toUpperCase()}`;
  
  try {
    console.log(`Sending request to SVV API for: ${regnr.toUpperCase()}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'SVV-Authorization': API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SVV API error (${response.status}): ${errorText}`);
      
      // Provide a more user-friendly error message
      if (response.status === 404) {
        return res.status(404).json({ error: 'Registreringsnummeret ble ikke funnet' });
      }
      
      res.status(response.status).json({ error: 'Feil ved søk etter kjøretøy' });
      return;
    }
    
    // Get the raw data from SVV
    const svvData = await response.json();
    
    // Transform SVV data to our expected format
    try {
      // Check if we have vehicle data
      if (!svvData.kjoretoydataListe || svvData.kjoretoydataListe.length === 0) {
        return res.status(404).json({ error: 'Ingen kjøretøydata funnet' });
      }
      
      const kjoretoy = svvData.kjoretoydataListe[0];
      
      // Extract and format data from the SVV structure
      const formattedData = {
        regnr: regnr.toUpperCase(),
        merke: extractMerke(kjoretoy),
        modell: extractModell(kjoretoy),
        årsmodell: extractAarsmodell(kjoretoy),
        motor: extractMotorInfo(kjoretoy)
      };
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Send the formatted data to frontend
      res.json(formattedData);
      
    } catch (parseError) {
      console.error('Error parsing SVV data:', parseError);
      
      // For debugging, you can log the raw data structure
      console.log('Raw SVV data structure:', JSON.stringify(svvData).substring(0, 500) + '...');
      
      res.status(500).json({ error: 'Kunne ikke tolke kjøretøydata' });
    }
  } catch (e) {
    console.error('General error with SVV API call:', e);
    res.status(500).json({ error: 'Teknisk feil ved oppslag' });
  }
}

// Helper functions to extract data from SVV API response
function extractMerke(kjoretoy) {
  return kjoretoy?.godkjenning?.tekniskGodkjenning?.fabrikatMerke?.merke || 'Ukjent';
}

function extractModell(kjoretoy) {
  return kjoretoy?.godkjenning?.tekniskGodkjenning?.handelsbetegnelse || 'Ukjent';
}

function extractAarsmodell(kjoretoy) {
  return kjoretoy?.registrering?.foerstegangsRegistrering?.aar?.toString() || 'Ukjent';
}

function extractMotorInfo(kjoretoy) {
  const tekniskData = kjoretoy?.godkjenning?.tekniskGodkjenning;
  if (!tekniskData) return 'Ukjent';
  
  const motorytelse = tekniskData.motorytelseListe?.[0]?.motorytelse;
  const slagvolum = tekniskData.slagvolum;
  const drivstoff = tekniskData.drivstoffListe?.[0]?.drivstoff;
  
  let motorinfo = '';
  
  if (slagvolum) {
    // Convert to liters and format with one decimal
    motorinfo += `${(slagvolum/1000).toFixed(1)} L `;
  }
  
  if (motorytelse) {
    motorinfo += `${motorytelse} hk `;
  }
  
  if (drivstoff) {
    motorinfo += drivstoff;
  }
  
  return motorinfo.trim() || 'Ukjent';
}