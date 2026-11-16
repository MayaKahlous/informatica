🚀 Ferro Marketing - Leadgeneratie Platform

Welkom bij de GitHub repository van Ferro Marketing. Dit project bevat de website en het opdrachten-systeem voor ons marketingbureau.

👨‍💼 Mijn rol: Chef Product

Als Chef Product is het mijn taak om te bepalen welke functionaliteiten de meeste waarde opleveren voor het bedrijf. Voor een marketingbureau is dat ongetwijfeld het binnenhalen en overzichtelijk maken van nieuwe klantopdrachten.

Daarom heb ik ervoor gekozen om als "werkende functie" een Interactieve Opdrachten Tabel te ontwerpen. Klanten kunnen een formulier invullen voor een poster, logo of reclamecampagne, en deze verschijnt direct visueel in ons dashboard.

⚙️ Werkende Functie: Interactieve Tabel (JavaScript)

Hieronder staat de kern van de JavaScript-code die ik heb ontworpen. Deze code pakt de gegevens uit het formulier en bouwt daar direct een nieuwe rij van in de actieve opdrachten-tabel.

// Functie ontworpen door de Chef Product voor het interactief 
// bijhouden van nieuwe klantaanvragen.

let opdrachtenAantal = 0;

function handleAppointment(event) {
    event.preventDefault(); // Voorkom dat de pagina herlaadt
    
    // 1. Haal waarden uit het formulier op
    const naam = document.getElementById('veld-naam').value;
    const bedrijf = document.getElementById('veld-bedrijf').value || 'Particulier';
    const dienst = document.getElementById('veld-dienst').value;
    const deadline = document.getElementById('veld-deadline').value;

    // 2. Verwijder de "lege tabel" tekst als het de eerste opdracht is
    const legeTekst = document.getElementById('lege-tabel-tekst');
    if (legeTekst) {
        legeTekst.parentElement.remove();
    }

    // 3. Maak een nieuwe HTML-rij (tr) voor in de tabel
    const tabelBody = document.getElementById('opdrachten-tabel');
    const nieuweRij = document.createElement('tr');
    
    // 4. Vul de rij met de data van de klant
    nieuweRij.innerHTML = `
        <td>${naam}</td>
        <td>${bedrijf}</td>
        <td><strong>${dienst}</strong></td>
        <td>${deadline}</td>
        <td>⏳ In behandeling</td>
    `;

    // 5. Voeg de rij toe aan de tabel op het scherm
    tabelBody.appendChild(nieuweRij);

    // 6. Update de live teller bovenaan de tabel
    opdrachtenAantal++;
    document.getElementById('teller').innerText = `${opdrachtenAantal} opdrachten`;
}


🛠️ Gebruikte Technologieën

Frontend: HTML5, CSS3 (Tailwind CSS)

Logica: Vanilla JavaScript (DOM manipulatie)
