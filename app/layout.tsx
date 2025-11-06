import "./globals.css";
import React from "react";
import { I18nProvider } from "../lib/i18n";
import Header from "../components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <head>
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
