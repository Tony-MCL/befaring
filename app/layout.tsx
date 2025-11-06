import "./globals.css";
import React from "react";
import ThemeToggle from "../components/ThemeToggle";
import LangToggle from "../components/LangToggle";
import Link from "next/link";
import { I18nProvider, useI18n } from "../lib/i18n";

function Header() {
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
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <head>
        {/* Initial theme (prevents flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            try{
              const m = localStorage.getItem('theme') || 'light';
              document.documentElement.setAttribute('data-theme', m);
            }catch(e){}
          `,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <I18nProvider>
          <Header />
          <main className="container">{children}</main>
          <footer className="container small">© Morning Coffee Labs</footer>
        </I18nProvider>
      </body>
    </html>
  );
}
