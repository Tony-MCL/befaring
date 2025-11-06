import "./globals.css";
import React from "react";
import Header from "../components/Header";
import { I18nProvider } from "../lib/i18n";

export const metadata = {
  title: "Befarings-app • Morning Coffee Labs",
  description: "Befaringer gjort enkelt – Prosjekter, bilder og notater (statisk, lokal)."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <I18nProvider>
          <Header />
          <main className="container">{children}</main>
          <footer className="container small">© {new Date().getFullYear()} Morning Coffee Labs</footer>
        </I18nProvider>
      </body>
    </html>
  );
}
