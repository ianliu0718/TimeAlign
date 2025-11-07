"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-context"
import { RotatingText } from "@/components/rotating-text"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Users, Sparkles, Globe } from "lucide-react"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Hero Section */}
      <section className="text-center mb-16 sm:mb-20 lg:mb-24">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance">
          {t("app.tagline")} <RotatingText /> {t("app.time")}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-balance px-4">
          {t("home.hero.subtitle")}
        </p>
        <Link href="/create">
          <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto">
            {t("home.hero.cta")}
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">{t("home.features.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg sm:text-xl mb-2">{t("home.feature1.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">{t("home.feature1.description")}</p>
          </Card>

          <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg sm:text-xl mb-2">{t("home.feature2.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">{t("home.feature2.description")}</p>
          </Card>

          <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg sm:text-xl mb-2">{t("home.feature3.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">{t("home.feature3.description")}</p>
          </Card>

          <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow">
            <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg sm:text-xl mb-2">{t("home.feature4.title")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">{t("home.feature4.description")}</p>
          </Card>
        </div>
      </section>
    </div>
  )
}
