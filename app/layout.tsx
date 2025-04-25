"use client"

import type React from "react"
import "./globals.css"
// import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { ShopifyAIProvider } from "@/contexts/ahoppyai-context"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "ShopifyAI - AI-Powered Shopify Development",
//   description: "Build Shopify stores faster with AI-generated code and real-time previews",
//   icons: {
//     icon: [
//       {
//         url: '/placeholder-logo.png',
//         sizes: '32x32',
//         type: 'image/png',
//       }
//     ],
//     shortcut: '/placeholder-logo.png',
//     apple: '/placeholder-logo.png',
//   }
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta name="cookie-policy" content="SameSite=None; Secure" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <ShopifyAIProvider>
              {children}
            </ShopifyAIProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
