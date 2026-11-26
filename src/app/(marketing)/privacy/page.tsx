import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacyverklaring", description: "Privacyverklaring van GeregeldWerk, een product van CodedByDefault." };

export default function PrivacyPage() {
  return (
    <main id="inhoud" className="legal-copy mx-auto w-full max-w-3xl px-4 py-16">
      <p className="legal-notice">Juridisch concept – laat deze verklaring vóór ingebruikname controleren door een privacyjurist.</p>
      <p className="eyebrow mt-8">Versie 26 november 2026</p><h1>Privacyverklaring</h1>
      <p>GeregeldWerk is een product van De Bumperbank, handelend onder de naam CodedByDefault, gevestigd in Hulst. CodedByDefault is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in deze verklaring.</p>
      <h2>1. Onze gegevens</h2><p>CodedByDefault / De Bumperbank · KvK 42171617 · btw NL005557496B77 · <a href="mailto:codedbydefault@gmail.com">codedbydefault@gmail.com</a> · <a href="https://www.codedbydefault.com/">codedbydefault.com</a>.</p>
      <h2>2. Welke gegevens we verwerken</h2><p>Afhankelijk van je gebruik verwerken we account- en contactgegevens, bedrijfs- en factuurgegevens, klantgegevens die jij invoert, aanvragen, offertes, facturen, communicatie, gebruiks- en beveiligingsgegevens, betaalstatus en gegevens uit het early-accessformulier. Vul geen bijzondere persoonsgegevens in tenzij dat noodzakelijk en rechtmatig is.</p>
      <h2>3. Doelen en grondslagen</h2><ul><li>de dienst leveren en accounts beheren: uitvoering van de overeenkomst;</li><li>betalingen, administratie en wettelijke bewaarplichten: overeenkomst en wettelijke verplichting;</li><li>beveiliging, misbruikpreventie en verbetering: gerechtvaardigd belang;</li><li>nieuws en early access: toestemming of gerechtvaardigd belang, met afmeldmogelijkheid.</li></ul>
      <h2>4. Gegevens van jouw klanten</h2><p>Voor persoonsgegevens die jij als ondernemer in GeregeldWerk invoert, ben jij doorgaans verwerkingsverantwoordelijke en handelt CodedByDefault als verwerker. Voor productiegebruik sluiten we waar nodig een verwerkersovereenkomst.</p>
      <h2>5. AI en geautomatiseerde verwerking</h2><p>AI kan conceptteksten en conceptdocumenten maken. Jij controleert en verstuurt deze zelf; GeregeldWerk neemt geen besluiten met rechtsgevolg zonder menselijke tussenkomst. Bij optionele lokale verwerking via Ollama blijven prompts in beginsel op de door jou beheerde omgeving. Bij andere AI-leveranciers informeren we je vóór activering over de verwerking.</p>
      <h2>6. Ontvangers en doorgifte</h2><p>We kunnen leveranciers inzetten voor hosting, database, e-mail, betalingen en beveiliging, waaronder Vercel, Supabase, Resend en Stripe. Peppol-koppelingen worden pas gebruikt wanneer je deze activeert. Leveranciers ontvangen alleen noodzakelijke gegevens en worden contractueel gebonden. Bij verwerking buiten de EER gebruiken we een geldige doorgiftegrondslag en passende waarborgen.</p>
      <h2>7. Bewaartermijnen</h2><p>We bewaren gegevens niet langer dan nodig. Administratieve gegevens bewaren we zolang de belastingwet dat vereist. Account- en documentgegevens verwijderen of anonimiseren we na beëindiging volgens de productinstellingen en back-upcyclus. Early-accessgegevens verwijderen we bij afmelding of uiterlijk 24 maanden na het laatste relevante contact, tenzij een andere plicht geldt.</p>
      <h2>8. Beveiliging</h2><p>We nemen passende technische en organisatorische maatregelen, waaronder toegangsbeperking, versleutelde verbindingen, logging en beveiligde leveranciers. Geen systeem is volledig risicoloos.</p>
      <h2>9. Jouw rechten</h2><p>Je kunt verzoeken om inzage, correctie, verwijdering, beperking, overdracht of bezwaar, en toestemming intrekken. Mail ons via bovenstaand adres. We kunnen je identiteit controleren en reageren in beginsel binnen één maand. Je kunt ook een klacht indienen bij de <a href="https://autoriteitpersoonsgegevens.nl/">Autoriteit Persoonsgegevens</a> of, waar toepasselijk, de <a href="https://www.gegevensbeschermingsautoriteit.be/">Belgische Gegevensbeschermingsautoriteit</a>.</p>
      <h2>10. Wijzigingen</h2><p>We kunnen deze verklaring aanpassen wanneer de dienst of wetgeving verandert. De actuele versie staat op deze pagina; bij belangrijke wijzigingen informeren we actieve gebruikers.</p>
      <p><Link href="/">Terug naar GeregeldWerk</Link> · <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link></p>
    </main>
  );
}
