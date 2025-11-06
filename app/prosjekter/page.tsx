"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../../lib/i18n";

type Project = {
  id: string;
  name: string;
  owner: string;
  members: string[];
  notes?: string;
  docs?: string[]; // relative paths under /content/pages
};

type Photo = { id: string; dataUrl: string; ts: number };

function useQueryId() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const u = new URL(window.location.href);
    setId(u.searchParams.get("id"));
  }, []);
  return id;
}

export default function ProjectsPage() {
  const { t, basePath } = useI18n();
  const pid = useQueryId();
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<Project | null>(null);
  const [notes, setNotes] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    fetch(`${basePath}/content/apps.json`)
      .then((r) => r.json())
      .then((arr: Project[]) => {
        setProjects(arr);
      })
      .catch(() => setProjects([]));
  }, [basePath]);

  useEffect(() => {
    const p = projects.find((x) => x.id === pid) || projects[0] || null;
    setActive(p || null);
  }, [projects, pid]);

  // Notater per prosjekt (localStorage)
  useEffect(() => {
    if (!active) return;
    const raw = localStorage.getItem(`notes:${active.id}`);
    setNotes(raw ?? "");
  }, [active]);

  // Album per prosjekt (localStorage)
  const albumKey = useMemo(() => (active ? `album:${active.id}` : null), [active]);
  useEffect(() => {
    if (!albumKey) return;
    const raw = localStorage.getItem(albumKey);
    setPhotos(raw ? (JSON.parse(raw) as Photo[]) : []);
  }, [albumKey]);
  const saveAlbum = (arr: Photo[]) => {
    if (!albumKey) return;
    localStorage.setItem(albumKey, JSON.stringify(arr));
    setPhotos(arr);
  };

  const onPick = () => inputRef.current?.click();
  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const taken: Photo[] = [];
    for (const f of Array.from(files)) {
      const dataUrl = await fileToDataURL(f);
      taken.push({ id: crypto.randomUUID(), dataUrl, ts: Date.now() });
    }
    saveAlbum([...(photos || []), ...taken]);
  };

  const removePhoto = (id: string) => saveAlbum((photos || []).filter((p) => p.id !== id));

  return (
    <div className="grid">
      <section className="card">
        <h2 style={{ marginTop: 0 }}>{t("projects_title")}</h2>
        {projects.length === 0 && <div className="small">{t("empty_state")}</div>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {projects.map((p) => (
            <li key={p.id} style={{ marginBottom: ".5rem" }}>
              <a className="button ghost" href={`${basePath}/prosjekter/?id=${encodeURIComponent(p.id)}`}>
                {p.name} <span className="small">({p.id})</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>{active?.name || "—"}</h2>
        <p className="small">{active?.id}</p>

        {/* Dokumentasjon (Markdown-filer i /content/pages) */}
        <div style={{ marginTop: ".8rem" }}>
          <h3 style={{ marginTop: 0 }}>{t("docs")}</h3>
          <ul style={{ paddingLeft: "1rem" }}>
            {(active?.docs?.length ? active.docs : ["pages/innledning.md", "pages/sikkerhet.md"])!.map((rel) => (
              <li key={rel}>
                <a href={`${basePath}/content/${rel}`} target="_blank" rel="noreferrer">
                  {rel.split("/").pop()}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Notater (lagres i localStorage per prosjekt) */}
        <div style={{ marginTop: ".8rem" }}>
          <h3 style={{ marginTop: 0 }}>{t("notes")}</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => active && localStorage.setItem(`notes:${active.id}`, notes)}
            placeholder="Skriv notater her …"
            style={{
              width: "100%",
              minHeight: 120,
              borderRadius: 8,
              border: "1px solid var(--mcl-outline)",
              padding: ".6rem",
              background: "var(--mcl-bg)",
            }}
          />
        </div>
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>{t("album")}</h3>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".6rem" }}>
          <button className="button" onClick={onPick}>
            {t("upload_images")}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            hidden
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: ".5rem" }}>
          {(photos || []).map((ph) => (
            <figure key={ph.id} style={{ margin: 0 }}>
              <img
                src={ph.dataUrl}
                alt=""
                style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 8, border: "1px solid var(--mcl-outline)" }}
              />
              <button className="button ghost small" style={{ marginTop: ".25rem", width: "100%" }} onClick={() => removePhoto(ph.id)}>
                Fjern
              </button>
            </figure>
          ))}
        </div>
        <p className="small" style={{ marginTop: ".6rem" }}>
          Tips: På mobil kan du ta bilder direkte (kamera) via knappen over. Alt lagres lokalt (demo).
        </p>
      </section>
    </div>
  );
}

async function fileToDataURL(file: File) {
  return new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
