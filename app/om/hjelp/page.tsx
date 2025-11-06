"use client";
import React from "react";
import { useI18n } from "../../../lib/i18n";
import Link from "next/link";

export default function HelpPage() {
  const { t, basePath } = useI18n();
  return (
    <article className="card">
      <h1 style={{ marginTop: 0 }}>Om / Hjelp</h1>
      <p className="small">
        {t("appName")} lagrer data lokalt i nettleseren (localStorage). Ingen server-API inngår i denne versjonen.
      </p>
      <ul>
        <li>Opprett prosjekter, legg til brukere (tilgangsliste) og skriv notater.</li>
        <li>Last opp bilder fra kamera/kamerarull. Bildene lagres som data-URLer for enkel demo.</li>
        <li>Legg til dokumentlenker (URL) eller korte notater.</li>
      </ul>
      <p className="small">Mer statisk innhold kan legges i <code>/content/pages</code> og hentes ved behov.</p>
      <p className="small">Logo referanse: <code>{basePath}/images/mcl-logo.png</code>.</p>
      <Link className="button" href="/prosjekter/">Gå til prosjekter</Link>
    </article>
  );
}
