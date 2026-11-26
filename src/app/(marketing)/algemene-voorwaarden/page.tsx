import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Algemene voorwaarden", description: "Algemene voorwaarden van GeregeldWerk, een product van CodedByDefault." };

export default function TermsPage() {
  return (
    <main id="inhoud" className="legal-copy mx-auto w-full max-w-3xl px-4 py-16">
      <p className="legal-notice">Juridisch concept – uitsluitend voor zakelijke klanten en vóór publicatie juridisch laten controleren.</p>
      <p className="eyebrow mt-8">Versie 26 november 2026</p><h1>Algemene voorwaarden GeregeldWerk</h1>
      <p>Deze voorwaarden gelden voor de zakelijke GeregeldWerk-dienst van CodedByDefault, gevestigd in Hulst, KvK 42171617, btw NL005557496B77, bereikbaar via <a href="mailto:codedbydefault@gmail.com">codedbydefault@gmail.com</a>.</p>
      <h2>1. Toepasselijkheid</h2><p>Deze voorwaarden gelden voor ieder aanbod, iedere overeenkomst en ieder gebruik van GeregeldWerk door een onderneming of beroepsmatig handelende gebruiker. Afwijkingen gelden alleen wanneer schriftelijk overeengekomen. Voor consumenten zijn deze conceptvoorwaarden niet bedoeld.</p>
      <h2>2. Totstandkoming en account</h2><p>Een overeenkomst ontstaat na aanvaarding van een concreet aanbod of bevestiging van een betaald abonnement. Een wachtlijstinschrijving is geen bestelling. De klant verstrekt juiste gegevens, beveiligt inlogmiddelen en meldt misbruik direct.</p>
      <h2>3. De dienst</h2><p>GeregeldWerk ondersteunt het opstellen en beheren van aanvragen, offertes en facturen. Functies die als bèta, demo, mock of “binnenkort” zijn aangeduid maken nog geen gegarandeerd onderdeel van de dienst uit. CodedByDefault mag de dienst verbeteren zolang de kernfunctie niet wezenlijk wordt uitgehold.</p>
      <h2>4. AI-concepten en controle</h2><p>Door AI gegenereerde tekst, bedragen, belastingkeuzes en documenten zijn concepten. De klant controleert juistheid, volledigheid, prijzen, btw, voorwaarden en geadresseerden vóór verzending. CodedByDefault geeft geen juridisch, fiscaal of boekhoudkundig advies.</p>
      <h2>5. Gebruik en klantgegevens</h2><p>De klant gebruikt de dienst rechtmatig, bezit de benodigde rechten en grondslagen voor ingevoerde gegevens en gebruikt de dienst niet voor misleiding, spam, malware of inbreuk. De klant blijft eigenaar van eigen inhoud en geeft CodedByDefault de beperkte toestemming die nodig is om de dienst te leveren.</p>
      <h2>6. Peppol en koppelingen</h2><p>Peppol-functionaliteit is alleen actief wanneer dit uitdrukkelijk in het account is bevestigd. Zolang de website de koppeling als in ontwikkeling of demo aanduidt, mogen gebruikers niet aannemen dat documenten daadwerkelijk via Peppol worden afgeleverd. Externe diensten kunnen eigen voorwaarden en storingen hebben.</p>
      <h2>7. Prijzen en betaling</h2><p>Vermelde zakelijke prijzen zijn exclusief btw, tenzij anders aangegeven. Facturen worden binnen de vermelde termijn betaald. Bij niet-tijdige betaling mag CodedByDefault na een redelijke waarschuwing toegang opschorten en wettelijke handelsrente en redelijke incassokosten rekenen.</p>
      <h2>8. Duur en beëindiging</h2><p>De abonnementsduur en opzegwijze volgen uit het gekozen aanbod. Opzegging werkt aan het einde van de lopende betaalperiode, tenzij anders overeengekomen. Bij ernstige tekortkoming mag de andere partij beëindigen nadat een redelijke hersteltermijn ongebruikt is verstreken; bij misbruik of acuut veiligheidsrisico mag direct worden opgeschort.</p>
      <h2>9. Beschikbaarheid en ondersteuning</h2><p>CodedByDefault spant zich in voor een veilige en bruikbare dienst, maar garandeert geen ononderbroken beschikbaarheid tenzij een afzonderlijke SLA is gesloten. Onderhoud kan tijdelijk invloed hebben op de dienst.</p>
      <h2>10. Intellectuele eigendom</h2><p>Alle rechten op de software, vormgeving, documentatie en merken blijven bij CodedByDefault of licentiegevers. De klant krijgt gedurende de overeenkomst een beperkt, niet-overdraagbaar gebruiksrecht voor de eigen bedrijfsvoering.</p>
      <h2>11. Privacy en beveiliging</h2><p>De <Link href="/privacy">privacyverklaring</Link> beschrijft eigen verwerkingen. Wanneer CodedByDefault persoonsgegevens namens de klant verwerkt, worden aanvullende verwerkersafspraken gemaakt waar de AVG dat vereist.</p>
      <h2>12. Aansprakelijkheid</h2><p>Voor zover wettelijk toegestaan is aansprakelijkheid beperkt tot directe schade en tot het bedrag dat de klant in de voorafgaande twaalf maanden voor de betreffende dienst betaalde, met een maximum van € 5.000. De beperking geldt niet bij opzet of bewuste roekeloosheid van de leiding, overlijden of letsel, of waar dwingend recht beperking verbiedt. Indirecte schade, waaronder gemiste winst en verlies van gegevens, is uitgesloten voor zover wettelijk toegestaan.</p>
      <h2>13. Overmacht</h2><p>Een partij is niet aansprakelijk voor vertraging door een omstandigheid buiten redelijke controle. Duurt die situatie langer dan zestig dagen, dan mag ieder de getroffen overeenkomst schriftelijk beëindigen zonder schadevergoeding.</p>
      <h2>14. Wijzigingen</h2><p>CodedByDefault kan deze voorwaarden wijzigen. Materiële wijzigingen worden vooraf aangekondigd. Als een wijziging de klant wezenlijk benadeelt, kan de klant vóór ingang opzeggen, tenzij de wijziging wettelijk noodzakelijk is.</p>
      <h2>15. Recht en geschillen</h2><p>Nederlands recht is van toepassing. Geschillen worden voorgelegd aan de bevoegde Nederlandse rechter, tenzij dwingend recht anders bepaalt. Partijen proberen eerst onderling een oplossing te vinden.</p>
      <p><Link href="/">Terug naar GeregeldWerk</Link> · <Link href="/privacy">Privacyverklaring</Link></p>
    </main>
  );
}
