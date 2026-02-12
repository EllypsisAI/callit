import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Vilkår — CallIt",
};

export default function TermsPage() {
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
          Vilkår for brug
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Sidst opdateret: februar 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              1. Hvad er CallIt
            </h2>
            <p className="mt-2">
              CallIt er en underholdningsplatform hvor du forudsiger resultater i
              content creators&apos; events ved hjælp af virtuelle point kaldet
              &quot;calls.&quot; Det er ikke gambling. Ingen rigtige penge er
              involveret.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              2. Vigtige fakta
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">
                  Calls (point) har ingen pengemæssig værdi.
                </strong>{" "}
                De kan ikke købes, sælges, handles eller indløses.
              </li>
              <li>
                <strong className="text-foreground">
                  Ingen rigtige penge i systemet.
                </strong>{" "}
                Ingen køb, gebyrer, indbetalinger eller udbetalinger.
              </li>
              <li>
                <strong className="text-foreground">
                  Ingen præmier med pengemæssig værdi.
                </strong>{" "}
                Leaderboard-rangeringer og bragging rights er de eneste
                belønninger.
              </li>
              <li>
                <strong className="text-foreground">
                  Dette er underholdningssoftware.
                </strong>{" "}
                Ikke en gambling-tjeneste, betting-platform eller et finansielt
                produkt.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              3. Alderskrav
            </h2>
            <p className="mt-2">
              Du skal være mindst <strong className="text-foreground">13 år</strong>{" "}
              for at bruge CallIt. Ved at oprette en konto bekræfter du, at du er
              mindst 13 år gammel.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              4. Din konto
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Du opretter dig med brugernavn, email og adgangskode.</li>
              <li>
                Du er ansvarlig for adgangen til din konto.
              </li>
              <li>
                Du modtager en startbalance af calls ved oprettelse. Disse er
                gratis.
              </li>
              <li>
                Vi kan nulstille eller justere point-balancer til enhver tid.
                Point er ikke din ejendom.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              5. Sådan fungerer forudsigelser
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Events oprettes af administratorer.</li>
              <li>
                Du placerer forudsigelser med dine calls på mulige udfald.
              </li>
              <li>
                Odds beregnes dynamisk baseret på alle forudsigelser
                (parimutuel-model).
              </li>
              <li>Resultater indtastes af administratorer efter events.</li>
              <li>
                <strong className="text-foreground">
                  Alle forudsigelser er endelige.
                </strong>{" "}
                Når de er placeret, kan de ikke ændres eller trækkes tilbage.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              6. Regler
            </h2>
            <p className="mt-2">Du accepterer ikke at:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Oprette flere konti</li>
              <li>Forsøge at manipulere forudsigelsessystemet</li>
              <li>Bruge automatiserede værktøjer eller bots</li>
              <li>Udgive dig for andre brugere eller content creators</li>
              <li>Bruge platformen til ulovlige formål</li>
            </ul>
            <p className="mt-2">
              Vi kan suspendere eller slette konti der overtræder disse regler.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              7. Ingen garantier
            </h2>
            <p className="mt-2">
              CallIt leveres &quot;som den er&quot; uden garantier af nogen art.
              Vi garanterer ikke oppetid, nøjagtighed af odds eller korrekthed
              af resultater. Vi kan ændre, suspendere eller lukke platformen til
              enhver tid.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              8. Ansvarsbegrænsning
            </h2>
            <p className="mt-2">
              CallIt og dets operatører er ikke ansvarlige for skader opstået ved
              brug af platformen. Da ingen rigtige penge er involveret og
              tjenesten er gratis, er der intet muligt økonomisk tab.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              9. Privatliv
            </h2>
            <p className="mt-2">
              Vi indsamler minimale personlige data. Se vores{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                privatlivspolitik
              </Link>{" "}
              for detaljer.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              10. Ændringer
            </h2>
            <p className="mt-2">
              Vi kan opdatere disse vilkår til enhver tid. Fortsat brug af CallIt
              efter ændringer udgør accept af de nye vilkår.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              11. Lovvalg
            </h2>
            <p className="mt-2">
              Disse vilkår er underlagt dansk lov. Eventuelle tvister afgøres ved
              danske domstole.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
              12. Kontakt
            </h2>
            <p className="mt-2">
              Spørgsmål om disse vilkår? Kontakt os på{" "}
              <a
                href="mailto:support@ellypsis.dk"
                className="text-primary hover:underline"
              >
                support@ellypsis.dk
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
