"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../../lib/i18n";
import Link from "next/link";

/** Types */
type User = { id: string; name: string; email?: string };
type ProjectImage = { id: string; name: string; dataUrl: string; createdAt: number };
type ProjectDoc = { id: string; title: string; url?: string; note?: string };
type Project = {
  id: string;
  title: string;
  owner: string;
  users: User[];           // tilgangsliste
  notes: string;
  docs: ProjectDoc[];
  images: ProjectImage[];  // lagres som dataURL for enkel demo
  createdAt: number;
};

const STORAGE_KEY = "befaringsapp.projects";

/** Storage helpers (local) */
function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}
function saveProjects(list: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
const uid = () => Math.random().toString(36).slice(2, 10);

/** Components */
function ProjectCard({ p, onOpen, onDelete }: { p: Project; onOpen: () => void; onDelete: () => void }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem" }}>
        <strong>{p.title}</strong>
        <span className="small">{new Date(p.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="small">Eier: {p.owner} • Brukere: {p.users.length} • Bilder: {p.images.length}</div>
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
        <button className="button" onClick={onOpen}>Åpne</button>
        <button className="button ghost" onClick={onDelete}>Slett</button>
      </div>
    </div>
  );
}

/** Demo-knapp for å fylle inn eksempelprosjekter */
function DemoButton({
  setProjects,
  setActiveId
}: {
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { t } = useI18n();
  return (
    <button
      className="button"
      type="button"
      onClick={() => {
        const demo: Project[] = [
          {
            id: uid(),
            title: "Hodnaberg – Kontrollrom befaring",
            owner: "Prosjektleder",
            users: [{ id: uid(), name: "Feltbruker 1" }],
            notes: "Sjekk kabelmottak, dokumenter skapplass og adkomst.",
            docs: [
              { id: uid(), title: "Befaringssjekkliste (MD)", url: "/content/pages/om.md" },
              { id: uid(), title: "Kontaktinfo", url: "/content/pages/kontakt.md" }
            ],
            images: [],
            createdAt: Date.now()
          },
          {
            id: uid(),
            title: "Lang-Sima – Turbinhall",
            owner: "Salgsleder",
            users: [{ id: uid(), name: "Feltbruker 2" }, { id: uid(), name: "Foto" }],
            notes: "Fokus: Rørgater, arbeidsveier, løftepunkter.",
            docs: [{ id: uid(), title: "Prosjektbeskrivelse", url: "/content/pages/forside.md" }],
            images: [],
            createdAt: Date.now() - 1000 * 60 * 60 * 24
          }
        ];
        setProjects(demo);
        setActiveId(demo[0].id);
      }}
      aria-label={t("add_demo")}
    >
      {t("add_demo")}
    </button>
  );
}

export default function ProjectsPage() {
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // init
  useEffect(() => { setProjects(loadProjects()); }, []);
  useEffect(() => { saveProjects(projects); }, [projects]);

  const active = useMemo(() => projects.find(p => p.id === activeId) ?? null, [projects, activeId]);

  // CRUD
  const createProject = (title: string, owner: string) => {
    const p: Project = { id: uid(), title, owner, users: [], notes: "", docs: [], images: [], createdAt: Date.now() };
    setProjects(prev => [p, ...prev]);
    setActiveId(p.id);
  };
  const deleteProject = (id: string) => {
    if (!confirm("Slette prosjekt?")) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeId === id) setActiveId(null);
  };
  const upsert = (next: Project) => setProjects(prev => prev.map(p => (p.id === next.id ? next : p)));

  // Image handlers
  const fileInput = useRef<HTMLInputElement | null>(null);
  const addImages = async (files: FileList) => {
    if (!active) return;
    const reads = Array.from(files).map(async (f) => {
      const dataUrl = await fileToDataURL(f);
      return { id: uid(), name: f.name, dataUrl, createdAt: Date.now() } as ProjectImage;
    });
    const imgs = await Promise.all(reads);
    upsert({ ...active, images: [...active.images, ...imgs] });
  };
  const downloadImage = (img: ProjectImage) => {
    const a = document.createElement("a");
    a.href = img.dataUrl;
    a.download = img.name || "image";
    a.click();
  };
  const removeImage = (id: string) => {
    if (!active) return;
    upsert({ ...active, images: active.images.filter(i => i.id !== id) });
  };

  // Docs
  const addDoc = (title: string, url?: string, note?: string) => {
    if (!active) return;
    const doc: ProjectDoc = { id: uid(), title, url, note };
    upsert({ ...active, docs: [doc, ...active.docs] });
  };
  const removeDoc = (id: string) => active && upsert({ ...active, docs: active.docs.filter(d => d.id !== id) });

  return (
    <section className="grid" style={{ gridTemplateColumns: "minmax(260px, 380px) 1fr" }}>
      {/* Left: list & create */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{t("projects_title")}</h2>
        <CreateProject onCreate={createProject} />
        {projects.length === 0 ? (
          <p className="small">
            {t("empty_state")} <DemoButton setProjects={setProjects} setActiveId={setActiveId} />
          </p>
        ) : (
          <div style={{ display: "grid", gap: ".6rem" }}>
            {projects.map(p => (
              <ProjectCard key={p.id} p={p} onOpen={() => setActiveId(p.id)} onDelete={() => deleteProject(p.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Right: details */}
      <div className="card">
        {active ? (
          <ProjectDetails
            project={active}
            onChange={upsert}
            onAddImagesClick={() => fileInput.current?.click()}
            onFilesSelected={(fl) => addImages(fl)}
            onDownload={downloadImage}
            onRemoveImage={removeImage}
            onAddDoc={addDoc}
            onRemoveDoc={removeDoc}
          />
        ) : (
          <div>
            <p>Velg et prosjekt fra listen til venstre.</p>
            <p className="small">Tips: På mobil kan du scrolle ned for detaljer etter at du har opprettet et prosjekt.</p>
          </div>
        )}
        {/* Hidden file input with camera support on mobile */}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => e.currentTarget.files && addImages(e.currentTarget.files)}
        />
      </div>
    </section>
  );
}

/** Subcomponents */
function CreateProject({ onCreate }: { onCreate: (title: string, owner: string) => void }) {
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate(title.trim(), owner.trim() || "Uten navn");
        setTitle(""); setOwner("");
      }}
      style={{ display: "grid", gap: ".5rem", marginBottom: "1rem" }}
    >
      <input placeholder="Prosjektnavn" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Eier / Prosjektleder" value={owner} onChange={(e) => setOwner(e.target.value)} />
      <button className="button" type="submit">Opprett prosjekt</button>
    </form>
  );
}

function ProjectDetails(props: {
  project: Project;
  onChange: (p: Project) => void;
  onAddImagesClick: () => void;
  onFilesSelected: (files: FileList) => void;
  onDownload: (img: ProjectImage) => void;
  onRemoveImage: (id: string) => void;
  onAddDoc: (title: string, url?: string, note?: string) => void;
  onRemoveDoc: (id: string) => void;
}) {
  const { project, onChange, onAddImagesClick, onDownload, onRemoveImage, onAddDoc, onRemoveDoc } = props;

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docNote, setDocNote] = useState("");

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: ".5rem", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{project.title}</h2>
        <span className="small">ID: {project.id}</span>
      </header>

      {/* Access / users */}
      <section>
        <h3 style={{ marginTop: 0 }}>Tilgang</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next: User = { id: uid(), name: userName.trim() || "Uten navn", email: userEmail.trim() || undefined };
            onChange({ ...project, users: [...project.users, next] });
            setUserName(""); setUserEmail("");
          }}
          style={{ display: "grid", gap: ".5rem", gridTemplateColumns: "1fr 1fr auto" }}
        >
          <input placeholder="Navn" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <input placeholder="E-post (valgfritt)" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
          <button className="button" type="submit">Legg til</button>
        </form>
        {project.users.length > 0 ? (
          <ul style={{ margin: ".5rem 0 0", paddingLeft: "1rem" }}>
            {project.users.map(u => (
              <li key={u.id} className="small" style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                <span>{u.name}{u.email ? ` · ${u.email}` : ""}</span>
                <button className="button ghost" onClick={() => onChange({ ...project, users: project.users.filter(x => x.id !== u.id) })}>Fjern</button>
              </li>
            ))}
          </ul>
        ) : <p className="small">Ingen brukere tildelt ennå.</p>}
      </section>

      {/* Notes */}
      <section>
        <h3 style={{ marginTop: 0 }}>Notater</h3>
        <textarea
          value={project.notes}
          onChange={(e) => onChange({ ...project, notes: e.target.value })}
          rows={6}
          placeholder="Skriv prosjekt-notater her..."
          style={{ width: "100%" }}
        />
      </section>

      {/* Docs */}
      <section>
        <h3 style={{ marginTop: 0 }}>Dokumentasjon</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!docTitle.trim()) return;
            onAddDoc(docTitle.trim(), docUrl.trim() || undefined, docNote.trim() || undefined);
            setDocTitle(""); setDocUrl(""); setDocNote("");
          }}
          style={{ display: "grid", gap: ".5rem", gridTemplateColumns: "2fr 2fr 2fr auto" }}
        >
          <input placeholder="Tittel" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
          <input placeholder="URL (valgfritt)" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
          <input placeholder="Notat (valgfritt)" value={docNote} onChange={(e) => setDocNote(e.target.value)} />
          <button className="button" type="submit">Legg til</button>
        </form>
        {project.docs.length > 0 ? (
          <ul style={{ margin: ".5rem 0 0", paddingLeft: "1rem" }}>
            {project.docs.map(d => (
              <li key={d.id} style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <span>{d.title}</span>
                {d.url && <Link className="button ghost" href={d.url} target="_blank">Åpne</Link>}
                {d.note && <span className="small">– {d.note}</span>}
                <button className="button ghost" onClick={() => onRemoveDoc(d.id)}>Fjern</button>
              </li>
            ))}
          </ul>
        ) : <p className="small">Ingen dokumenter lagt til.</p>}
      </section>

      {/* Images */}
      <section>
        <h3 style={{ marginTop: 0 }}>Bilder / Album</h3>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".5rem" }}>
          <button className="button" onClick={onAddImagesClick}>Ta bilde / Last opp</button>
        </div>
        {project.images.length === 0 ? (
          <p className="small">Ingen bilder enda.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: ".5rem" }}>
            {project.images.map(img => (
              <figure key={img.id} style={{ border: `1px solid var(--mcl-outline)`, borderRadius: 12, padding: 6 }}>
                <img src={img.dataUrl} alt={img.name} style={{ width: "100%", borderRadius: 8 }} />
                <figcaption className="small" style={{ display: "flex", gap: ".5rem", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</span>
                  <div style={{ display: "flex", gap: ".25rem" }}>
                    <button className="button ghost" onClick={() => onDownload(img)}>Last ned</button>
                    <button className="button ghost" onClick={() => onRemoveImage(img.id)}>Slett</button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        <p className="small">Tips: På mobil åpner knappen kamera. På PC kan du velge filer eller dra–slippe.</p>
      </section>
    </div>
  );
}

/** utils */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}
