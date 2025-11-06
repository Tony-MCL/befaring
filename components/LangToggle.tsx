"use client";
import React from "react";
import { useI18n } from "../lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useI18n();
  const cycle = () => setLang(lang === "no" ? "en" : "no");
  return (
    <button className="button ghost" onClick={cycle} aria-label="Toggle language">
      {lang.toUpperCase()}
    </button>
  );
}
