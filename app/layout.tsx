import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LangToggle } from '@/components/LangToggle'
import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/firebase'

export const metadata: Metadata = {
  title: 'Befarings-app',
  description: 'Prosjekt- og befaring – Morning Coffee Labs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body>
        <I18nProvider>
          <AuthProvider>
            <header className="appbar">
              <nav style={{display:'flex',gap:8,alignItems:'center'}}>
                <Link href="/">Home</Link>
                <Link href="/om">Om</Link>
                <Link href="/prosjekter">Prosjekter</Link>
                <Link href="/filosofi">Filosofi</Link>
                <Link href="/kontakt">Kontakt</Link>
                <Link href="/portal">Portal</Link>
              </nav>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <LangToggle />
                <ThemeToggle />
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/mcl-logo.png`}
                  alt="MCL"
                  style={{height:28}}
                />
              </div>
            </header>
            <main className="container">{children}</main>
            <footer>© {new Date().getFullYear()} Morning Coffee Labs</footer>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
