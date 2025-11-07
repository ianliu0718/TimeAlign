"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-context"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeToggle } from "./theme-toggle"
import { Calendar } from "lucide-react"

export function Header() {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">{t("app.name")}</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/guide"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-3 py-2"
            >
              {t("nav.guide")}
            </Link>
            <Link
              href="/create"
              className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-3 sm:px-4 py-2 rounded-md"
            >
              {t("nav.createEvent")}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
