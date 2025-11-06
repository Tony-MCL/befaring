// /lib/i18n.tsx
"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "no" | "en";
type Dict = Record<string, string>;

const dictNO: Dict = {
  appName: "Befarings-app",
  nav_home: "Forside",
  nav_projects: "Prosjekter",
  nav_help: "Om/Hjelp",
  nav_contact: "Kontakt",
  nav_portal: "Portal",
  hero_title: "Befaringer gjort enkelt",
  hero_sub: "Opprett prosjekter, del tilgang og samle bilder og notater – på tvers av PC og mobil.",
  get_started: "Kom i gang",
  projects_title: "Dine prosjekter",
  empty_state: "Ingen prosjekter enda.",
  add_demo: "Legg til demo-prosjekter",
  upload_images: "Last opp bilder",
  notes: "Notater",
  docs: "Dokumentasjon",
  album: "Album"
};

const dictEN: Dict = {
  appName: "Site Inspection App",
  nav_home: "Home",
  nav_projects: "Projects",
  nav_help: "About/Help",
  nav_contact: "Contact",
  nav_portal: "Portal",
  hero_title: "Inspections made simple",
  hero_sub: "Create projects, share access, and collect photos & notes — across desktop and mobile.",
  get_started: "Get started",
  projects_title: "Your projects",
  empty_state: "No projects yet.",
  add_demo: "Add demo projects",
  upload_images: "Upload photos",
  notes: "Notes",
  docs: "Documentation",
  album: "Album"
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; basePath: string; };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const [lang, setLangState] = useState<Lang>("no");
  useEffect(() => {
    const saved = (localStorage.getItem("lang") as Lang) || "no";
    setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { localStorage.setItem("lang", l); setLangState(l); };
  const dict = lang === "no" ? dictNO : dictEN;
  const t = (k: string) => dict[k] ?? k;
  const value = useMemo(() => ({ lang, setLang, t, basePath }), [lang, basePath]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}
export const useI18n = () => {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("I18nProvider missing");
  return ctx;
};
