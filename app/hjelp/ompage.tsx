// /app/om/hjelp/page.tsx
import React from "react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <article className="card">
      <h1 style={{ marginTop: 0 }}>Om / Hjelp</h1>
      <p>
        Denne prototypen er statisk (GitHub Pages). Ingen server eller innlogging ennå.
        <br />
        Plan: Prosjektopprettelse, tilgangsstyring, dokumenter og felt-opplasting fra mobil.
      </p>
      <p>
        Se <Link href="/prosjekter/">Prosjekter</Link> for demo.
      </p>
    </article>
  );
}
