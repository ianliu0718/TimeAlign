"use client"

import type React from "react"
import { ThemeProvider } from "@/lib/theme-context"
import { LanguageProvider } from "@/lib/i18n/language-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  )
}
