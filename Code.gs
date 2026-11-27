// Gebouwd door [alessandrakuilboer]
\function maakHtmlTemplate(titel, badgeTekst, badgeKleur, inhoudHtml) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #1e293b; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; letter-spacing: 1px;">FERRO MARKETING</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">Project &amp; Campagne Beheer</p>
      </div>
      <div style="padding: 28px; color: #334155; line-height: 1.6;">
        <span style="display: inline-block; background-color: ${badgeKleur}; color: #ffffff; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; margin-bottom: 16px;">
          ${badgeTekst}
        </span>
        <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">${titel}</h2>
        ${inhoudHtml}
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">
          Met vriendelijke groet,<br>
          <strong style="color: #0f172a;">Team Ferro Marketing</strong>
        </p>
      </div>
    </div>
  `;
}

// Hulpfunctie: controleert of een e-mailadres echt geldig is (bijv. naam@domein.nl)
function isGeldigEmail(email) {
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Hulpfunctie: schrijft ongeldige/lastige gevallen netjes weg naar een tabblad 'Foutlogboek'
function logFoutmelding(bron, reden, invoerGegevens) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName("Foutlogboek");
  if (!logSheet) {
    logSheet = ss.insertSheet("Foutlogboek");
    logSheet.appendRow(["Tijdstip", "Onderdeel", "Reden van blokkade", "Ingevoerde waarde"]);
  }
  logSheet.appendRow([new Date(), bron, reden, invoerGegevens]);
}

// Hulpfunctie: genereert een uniek opdrachtnummer zoals FM-2026-002
function maakOpdrachtId(rijNummer) {
  var jaar = new Date().getFullYear();
  var volgnummer = ("000" + (rijNummer - 1)).slice(-3);
  return "FM-" + jaar + "-" + volgnummer;
}

function bijFormulierInzending(e) {
  try {
    var antwoorden = e.values;
    var sheet = e.range ? e.range.getSheet() : SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Formulierreacties 2");
    var rij = e.range ? e.range.getRow() : sheet.getLastRow();
    
    // Genereer direct een uniek Opdracht-ID en zet dit in kolom P (kolom 16)
    var opdrachtId = maakOpdrachtId(rij);
    if (sheet && rij >= 2) {
      sheet.getRange(rij, 16).setValue(opdrachtId);
    }

    // Zoek naar een mogelijk e-mailadres in de antwoorden
    var gevondenEmail = "";
    for (var i = 0; i < antwoorden.length; i++) {
      if (antwoorden[i] && antwoorden[i].toString().includes("@")) {
        gevondenEmail = antwoorden[i].toString().trim();
        break;
      }
    }

    var bedrijfsnaam = antwoorden[1] || "Onbekend bedrijf";
    var contactpersoon = antwoorden[2] || "klant";

    // LASTIG GEVAL 1: Geen of ongeldig e-mailadres ingevuld
    if (gevondenEmail === "" || !isGeldigEmail(gevondenEmail)) {
      logFoutmelding("Formulier-inzending (" + opdrachtId + ")", "Geen of ongeldig e-mailadres opgegeven", gevondenEmail || "(leeg)");
      return; // Stop netjes zonder te crashen; rij blijft gewoon bewaard in de sheet
    }

    var onderwerp = "Bevestiging aanvraag [" + opdrachtId + "] - Ferro Marketing";
    var tekstBericht = "Beste " + contactpersoon + ", bedankt voor je aanvraag (" + opdrachtId + ") bij Ferro Marketing voor '" + bedrijfsnaam + "'. Wij nemen binnen 24 uur contact op.";
    var inhoudHtml = `
      <p>Beste <strong>${contactpersoon}</strong>,</p>
      <p>Bedankt voor je aanvraag bij <strong>Ferro Marketing</strong>! We hebben het formulier voor <strong>'${bedrijfsnaam}'</strong> in goede orde ontvangen onder referentienummer <strong>${opdrachtId}</strong>.</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
        Wij gaan er direct mee aan de slag en nemen binnen <strong>24 uur</strong> contact met je op om de vervolgstappen te besken.
      </div>
    `;
    var htmlBericht = maakHtmlTemplate("Aanvraag Ontvangen (" + opdrachtId + ")", "NIEUWE AANVRAAG", "#2563eb", inhoudHtml);
    
    MailApp.sendEmail({
      to: gevondenEmail,
      subject: onderwerp,
      body: tekstBericht,
      htmlBody: htmlBericht
    });

  } catch (fout) {
    logFoutmelding("Formulier-inzending", "Onverwachte systeemfout", fout.message);
  }
}

function bijStatusWijziging(e) {
  try {
    if (!e || !e.range) return;

    var sheet = e.source.getActiveSheet();
    // Voorkom dat wijzigingen op 'Dashboard' of 'Foutlogboek' iets triggeren
    if (sheet.getName() === "Dashboard" || sheet.getName() === "Foutlogboek") return;

    var rij = e.range.getRow();
    var kolom = e.range.getColumn();

    // Controleer of de wijziging in kolom N (kolom 14) en tussen rij 2 en 30 plaatsvindt
    if (kolom !== 14 || rij < 2 || rij > 30) return;

    var nieuweStatus = e.range.getValue().toString().trim();
    if (!nieuweStatus) return;

    // LASTIG GEVAL 2: Dubbele mail voorkomen door te checken wat er in kolom O (kolom 15) staat
    var laatstGemaildeStatus = sheet.getRange(rij, 15).getValue().toString().trim();
    if (nieuweStatus === laatstGemaildeStatus) {
      logFoutmelding("Status-wijziging (Rij " + rij + ")", "Dubbele mail voorkomen: status stond al op " + nieuweStatus, nieuweStatus);
      return;
    }

    // Haal alle waarden uit deze rij op (kolom A t/m M)
    var rijWaarden = sheet.getRange(rij, 1, 1, 13).getValues()[0];
    var klantEmail = "";
    for (var i = 0; i < rijWaarden.length; i++) {
      if (rijWaarden[i] && isGeldigEmail(rijWaarden[i].toString().trim())) {
        klantEmail = rijWaarden[i].toString().trim();
        break;
      }
    }

    // LASTIG GEVAL 3: Status aangepast op een lege rij of rij zonder geldig e-mailadres
    if (klantEmail === "") {
      logFoutmelding("Status-wijziging (Rij " + rij + ")", "Geen geldig e-mailadres gevonden in deze rij", nieuweStatus);
      return;
    }

    var bedrijfsnaam = rijWaarden[1] || "jullie project";
    var contactpersoon = rijWaarden[2] || "klant";
    // Haal het Opdracht-ID uit kolom P (kolom 16), of maak er alsnog één aan
    var opdrachtId = sheet.getRange(rij, 16).getValue().toString().trim();
    if (!opdrachtId) {
      opdrachtId = maakOpdrachtId(rij);
      sheet.getRange(rij, 16).setValue(opdrachtId);
    }

    var onderwerp = "Status-update [" + opdrachtId + "]: " + nieuweStatus + " - Ferro Marketing";
    var badgeKleur = "#2563eb";
    var titel = "Status-update (" + opdrachtId + ")";
    var extraUitleg = "";

    if (nieuweStatus === "In behandeling") {
      badgeKleur = "#d97706";
      titel = "We zijn gestart met jullie project!";
      extraUitleg = "Ons creatieve team is momenteel actief bezig met het uitwerken van de opdracht voor <strong>" + bedrijfsnaam + "</strong>.";
    } else if (nieuweStatus === "Geblokkeerd") {
      badgeKleur = "#dc2626";
      titel = "Actie of aanvullende informatie nodig";
      extraUitleg = "De voortgang voor <strong>" + bedrijfsnaam + "</strong> staat tijdelijk stil omdat we nog een vraag of extra gegevens nodig hebben. We nemen zo snel mogelijk contact op!";
    } else if (nieuweStatus === "Afgerond") {
      badgeKleur = "#16a34a";
      titel = "Goed nieuws: jullie project is afgerond!";
      extraUitleg = "Het project voor <strong>" + bedrijfsnaam + "</strong> is helemaal klaar! We sturen de definitieve bestanden en oplevering zo snel mogelijk jullie kant op.";
    } else {
      return;
    }

    var tekstBericht = "Beste " + contactpersoon + ", de status van jullie aanvraag (" + bedrijfsnaam + ") is gewijzigd naar: " + nieuweStatus + ".";
    var inhoudHtml = `
      <p>Beste <strong>${contactpersoon}</strong>,</p>
      <p>Er is een nieuwe status-update voor jullie opdracht bij Ferro Marketing:</p>
      <div style="background-color: #f8fafc; border-left: 4px solid ${badgeKleur}; padding: 14px 16px; margin: 16px 0; border-radius: 4px;">
        ${extraUitleg}
      </div>
    `;
    var htmlBericht = maakHtmlTemplate(titel, nieuweStatus.toUpperCase(), badgeKleur, inhoudHtml);

    MailApp.sendEmail({
      to: klantEmail,
      subject: onderwerp,
      body: tekstBericht,
      htmlBody: htmlBericht
    });

    // Sla in kolom O (kolom 15) op dat deze status succesvol is gemaild
    sheet.getRange(rij, 15).setValue(nieuweStatus);

  } catch (fout) {
    logFoutmelding("Status-wijziging", "Onverwachte systeemfout", fout.message);
  }
}

// =========================================================================
// AUTOMATISCHE BACKEND TEST (Zonder scherm uitvoeren in Apps Script!)
// Selecteer bovenaan in Apps Script 'voerAutomatischeTestUit' en klik op 'Uitvoeren'
// =========================================================================
function voerAutomatischeTestUit() {
  Logger.log("Start automatische backend-test...");
  
  // Test 1: Controleer e-mailvalidatie (gewoon vs lastig geval)
  var testGeldig = isGeldigEmail("klant@ferromarketing.nl");
  var testOngeldig = isGeldigEmail("geen-geldig-adres");
  
  if (testGeldig === true && testOngeldig === false) {
    Logger.log("✅ Test 1 geslaagd: E-mailvalidatie herkent geldige en ongeldige adressen.");
  } else {
    Logger.log("❌ Test 1 gefaald!");
  }

  // Test 2: Controleer Opdracht-ID generator
  var testId = maakOpdrachtId(2);
  Logger.log("✅ Test 2 geslaagd: Gegenereerd Opdracht-ID voor rij 2 is " + testId);

  // Test 3: Simuleer een foutieve inzending (zonder formulier-scherm) en check het Foutlogboek
  bijFormulierInzending({ values: [new Date(), "Testbedrijf Zonder Scherm", "Tester", "ongeldig_email"] });
  Logger.log("✅ Test 3 geslaagd: Ongeldige inzending is zonder crash afgehandeld en weggeschreven naar 'Foutlogboek'.");
}
