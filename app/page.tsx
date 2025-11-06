"use client";
import React from "react";
import { useI18n } from "../lib/i18n";
import Link from "next/link";

export default function HomePage() {
  const { t } = useI18n();
  return (
    <section className="grid">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>{t("hero_title")}</h1>
        <p className="small">{t("hero_sub")}</p>
        <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem" }}>
          <Link className="button" href="/prosjekter/">{t("get_started")}</Link>
          <Link className="button ghost" href="/om/hjelp/">Om / Hjelp</Link>
        </div>
      </div>
      <div className="card">
        <h3>Statisk & lokalt</h3>
        <p className="small">
          Ingen server. Prosjekter, bilder og notater lagres i din nettleser (localStorage).
          Passer for demo og små team.
        </p>
      </div>
      <div className="card">
        <h3>PC & Mobil</h3>
        <p className="small">Last opp fra filer eller ta bilder direkte (kamera-støtte på mobil).</p>
      </div>
    </section>
  );
}
