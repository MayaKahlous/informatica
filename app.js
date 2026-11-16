// Dit is een simpele backend server gebouwd met Node.js en Express.
// Je kunt deze code gebruiken voor je GitHub opdracht.

const express = require('express');
const app = express();
const port = 3000;

// Zorgt ervoor dat onze backend JSON-gegevens van de website kan lezen
app.use(express.json());

// ==========================================
// DE WERKENDE FUNCTIE: OPDRACHT VERWERKEN
// ==========================================
// Dit is de 'route' (API endpoint) waar de frontend het formulier naartoe stuurt.
app.post('/api/maak-afspraak', (req, res) => {
    
    // 1. Haal de ingevulde gegevens uit het verzoek (aangepast naar jouw wensen)
    const { naam, bedrijfsnaam, dienst, deadline } = req.body;

    // 2. Validatie (Controleer of de belangrijkste velden zijn ingevuld)
    if (!naam || !dienst || !deadline) {
        // Als er iets mist, sturen we een foutmelding (status 400 - Bad Request)
        return res.status(400).json({ 
            succes: false, 
            melding: "Let op: Naam, dienst en deadline zijn verplicht!" 
        });
    }

    // 3. Verwerking (Hier zou je het normaal in een database opslaan)
    // Voor deze opdracht "simuleren" we de database door het in de console te printen
    console.log("=== 🚀 NIEUWE OPDRACHT VOOR FERRO MARKETING ===");
    console.log(`Naam:        ${naam}`);
    console.log(`Bedrijf:     ${bedrijfsnaam ? bedrijfsnaam : 'Particulier'}`);
    console.log(`Dienst:      ${dienst}`);
    console.log(`Deadline:    ${deadline}`);
    console.log("===============================================");

    // 4. Bevestiging sturen naar de website
    res.status(201).json({
        succes: true,
        melding: `Beste ${naam}, de aanvraag voor een ${dienst} is succesvol geplaatst!`,
        opdrachtId: Math.floor(Math.random() * 10000) 
    });
});

// ==========================================
// SERVER STARTEN
// ==========================================
app.listen(port, () => {
    console.log(`✅ Backend server draait succesvol op http://localhost:${port}`);
    console.log(`⏳ Wachten op inkomende afspraken via POST /api/maak-afspraak...`);
});
