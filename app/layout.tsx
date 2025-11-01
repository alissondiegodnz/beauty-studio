import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"

export const metadata: Metadata = {
  title: "Maria Diniz",
  description: "Sistema de gestão para estúdio de beleza",
    generator: 'v0.app',
    icons: {
      icon: '/logo.png',
      shortcut: '/logo.png',
      apple: '/logo.png'
    }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
  <body>
        {<TopHeader />}
          <div className="flex rounded-1x2 min-h-[calc(100vh-4rem)]">
            <main className="flex p-6 bg-[var(--second-background)] rounded-1x2">
              <div className="rounded-xl bg-gradient-to-t from-[var(--gold-light)] to-[var(--rose-background)] p-1 h-full">
                <Sidebar />
              </div>
            </main>
            <main className="flex-1 p-6 bg-[var(--second-background)] rounded-1x2">
              <div className="rounded-xl bg-gradient-to-t from-[var(--gold-light)] to-[var(--rose-background)] shadow-sm p-16 h-full">
                {children}
              </div>
            </main>
          </div>
      </body>
    </html>
  )
}
