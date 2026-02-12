import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privatlivspolitik — CallIt",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 animate-fade-up">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tilbage
      </Link>

      <div className="mt-6 rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-lg shadow-primary/5">
        <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-pitch-dark via-primary to-pitch-light" />

        <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
          Privatlivspolitik
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Sidst opdateret: februar 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              1. Hvem er vi
            </h2>
            <p className="mt-2">
              CallIt er en underholdningsplatform til forudsigelser. Denne
              privatlivspolitik forklarer hvilke data vi indsamler, hvorfor, og
              hvordan vi håndterer dem.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">Dataansvarlig:</strong>{" "}
              Ellypsis
              <br />
              <strong className="text-foreground">Kontakt:</strong>{" "}
              <a
                href="mailto:support@ellypsis.dk"
                className="text-primary hover:underline"
              >
                support@ellypsis.dk
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              2. Hvilke data vi indsamler
            </h2>
            <p className="mt-2">
              Vi indsamler kun det minimum af data der er nødvendigt:
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-4 font-semibold text-foreground">
                      Data
                    </th>
                    <th className="pb-2 pr-4 font-semibold text-foreground">
                      Formål
                    </th>
                    <th className="pb-2 font-semibold text-foreground">
                      Grundlag (GDPR)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-4 text-foreground">Email</td>
                    <td className="py-2 pr-4">Oprettelse af konto og login</td>
                    <td className="py-2">Samtykke (Art. 6(1)(a))</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-foreground">Brugernavn</td>
                    <td className="py-2 pr-4">
                      Vises på leaderboards og forudsigelser
                    </td>
                    <td className="py-2">Samtykke (Art. 6(1)(a))</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-foreground">
                      Forudsigelsesaktivitet
                    </td>
                    <td className="py-2 pr-4">
                      Nødvendigt for at platformen fungerer
                    </td>
                    <td className="py-2">Legitim interesse (Art. 6(1)(f))</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Vi indsamler <strong className="text-foreground">ikke</strong>:
              adgangskoder (vi bruger sikker autentificering), betalingsoplysninger,
              lokationsdata, device fingerprints, eller data fra sociale medier.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              3. Hvordan vi bruger dine data
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Login og autentificering</li>
              <li>Visning af dit brugernavn og dine forudsigelser</li>
              <li>Leaderboard-rangeringer</li>
            </ul>
            <p className="mt-2">
              Vi sælger ikke dine data. Vi deler dem ikke med annoncører. Vi
              sender ikke marketing-emails.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              4. Opbevaring og sikkerhed
            </h2>
            <p className="mt-2">
              Data opbevares hos Supabase (EU-region) og Vercel. Al
              datatransmission foregår over HTTPS.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              5. Opbevaringsperiode
            </h2>
            <p className="mt-2">
              Kontodata (email, brugernavn) opbevares så længe din konto er
              aktiv. Ved sletning af konto fjernes alle personlige data inden for
              30 dage.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              6. Dine rettigheder (GDPR)
            </h2>
            <p className="mt-2">
              Under GDPR har du ret til at:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">Indsigt:</strong> Få en kopi
                af dine personlige data
              </li>
              <li>
                <strong className="text-foreground">Berigtigelse:</strong> Rette
                forkerte data
              </li>
              <li>
                <strong className="text-foreground">
                  Sletning (&quot;retten til at blive glemt&quot;):
                </strong>{" "}
                Anmode om sletning af din konto og alle tilknyttede data
              </li>
              <li>
                <strong className="text-foreground">Dataportabilitet:</strong>{" "}
                Modtage dine data i et struktureret format
              </li>
              <li>
                <strong className="text-foreground">Indsigelse:</strong> Gøre
                indsigelse mod behandling baseret på legitim interesse
              </li>
              <li>
                <strong className="text-foreground">
                  Tilbagetrækning af samtykke:
                </strong>{" "}
                Når som helst, ved at slette din konto
              </li>
            </ul>
            <p className="mt-2">
              Kontakt os på{" "}
              <a
                href="mailto:support@ellypsis.dk"
                className="text-primary hover:underline"
              >
                support@ellypsis.dk
              </a>{" "}
              for at udøve dine rettigheder. Vi svarer inden for 30 dage.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              7. Cookies
            </h2>
            <p className="mt-2">
              CallIt bruger kun strengt nødvendige cookies til login og
              session-håndtering. Vi bruger ingen tracking-cookies,
              reklame-cookies eller tredjeparts-analytics.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              8. Børn
            </h2>
            <p className="mt-2">
              CallIt kræver at brugere er mindst 13 år, i overensstemmelse med
              Danmarks implementering af GDPR artikel 8. Vi indsamler ikke
              bevidst data fra børn under 13.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              9. Tredjepartstjenester
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-4 font-semibold text-foreground">
                      Tjeneste
                    </th>
                    <th className="pb-2 pr-4 font-semibold text-foreground">
                      Formål
                    </th>
                    <th className="pb-2 font-semibold text-foreground">
                      Data delt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-4 text-foreground">Vercel</td>
                    <td className="py-2 pr-4">Hosting af websiden</td>
                    <td className="py-2">IP-adresser (server logs)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-foreground">Supabase</td>
                    <td className="py-2 pr-4">Database og autentificering</td>
                    <td className="py-2">Email, brugernavn, forudsigelser</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              10. Klager
            </h2>
            <p className="mt-2">
              Hvis du mener vi har overtrådt dine databeskyttelsesrettigheder,
              har du ret til at klage til Datatilsynet:
            </p>
            <p className="mt-2">
              <strong className="text-foreground">Datatilsynet</strong>
              <br />
              Carl Jacobsens Vej 35, 2500 Valby
              <br />
              <a
                href="https://www.datatilsynet.dk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                datatilsynet.dk
              </a>
              <br />
              <a
                href="mailto:dt@datatilsynet.dk"
                className="text-primary hover:underline"
              >
                dt@datatilsynet.dk
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
