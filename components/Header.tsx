"use client";
import React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import { useI18n } from "../lib/i18n";

export default function Header() {
  const { t, basePath } = useI18n();
  return (
    <header className="header">
      <div className="header-inner container">
        <div className="brand">
          <img src={`${basePath}/images/mcl-logo.png`} alt="MCL" />
          <span>{t("appName")}</span>
        </div>
        <nav className="nav">
          <Link href="/">{t("nav_home")}</Link>
          <Link href="/prosjekter/">{t("nav_projects")}</Link>
          <Link href="/om/hjelp/">{t("nav_help")}</Link>
          <Link href="/kontakt/">{t("nav_contact")}</Link>
          <Link href="/portal/">{t("nav_portal")}</Link>
        </nav>
        <div className="toolbar">
          <ThemeToggle />
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
