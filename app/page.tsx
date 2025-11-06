// /app/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Project = {
  id: string;
  name: string;
  owner: string;
  members: string[];
  notes?: string;
};

export default function HomePage() {
  const { t, basePath } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch(`${basePath}/content/apps.json`).then(r => r.json()).then(setProjects).catch(() => setProjects([]));
  }, [basePath]);

  const addDemo = async () => {
    const demo: Project[] = [
      { id: "P-1001", name: "Lang-Sima inspeksjon", owner: "mcl", members: ["anna", "per"] },
      { id: "P-1002", name: "Hodnaberg kabinett", owner: "mcl", members: ["per"] }
    ];
    setProjects(demo);
  };

  return (
    <div>
      <section className="card" style={{ marginTop: "1rem" }}>
        <h1 style={{ margin: 0 }}>{t("hero_title")}</h1>
        <p className="small" style={{ marginTop: ".4rem" }}>{t("hero_sub")}</p>
        <div style={{ marginTop: ".8rem", display: "flex", gap: ".6rem" }}>
          <a href={`${basePath}/prosjekter/`} className="button">{t("get_started")}</a>
          <button className="button secondary" onClick={addDemo}>{t("add_demo")}</button>
        </div>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <h2 style={{ marginBottom: ".6rem" }}>{t("projects_title")}</h2>
        {projects.length === 0 ? (
          <div className="small">{t("empty_state")}</div>
        ) : (
          <div className="grid">
            {projects.map(p => (
              <article key={p.id} className="card">
                <h3 style={{ marginTop: 0 }}>{p.name}</h3>
                <div className="small">{p.id} • {p.members.length} brukere</div>
                <div style={{ marginTop: ".6rem" }}>
                  <a className="button" href={`${basePath}/prosjekter/?id=${encodeURIComponent(p.id)}`}>Åpne</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
