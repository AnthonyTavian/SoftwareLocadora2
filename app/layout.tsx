import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import "./globals.css"

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sistema de Locadora",
  description: "Sistema de gestão para locadoras de veículos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist&family=Geist+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
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