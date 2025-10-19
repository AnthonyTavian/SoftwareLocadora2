import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Locadora",
  description: "Sistema de gestão para locadoras de veículos",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="locadora-theme">
          <div className="flex min-h-screen bg-background">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              <AppHeader />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
