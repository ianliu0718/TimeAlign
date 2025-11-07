"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function GuidePage() {
  const { t } = useLanguage()

  const steps = [
    {
      number: 1,
      title: t("guide.step1.title"),
      description: t("guide.step1.description"),
    },
    {
      number: 2,
      title: t("guide.step2.title"),
      description: t("guide.step2.description"),
    },
    {
      number: 3,
      title: t("guide.step3.title"),
      description: t("guide.step3.description"),
    },
    {
      number: 4,
      title: t("guide.step4.title"),
      description: t("guide.step4.description"),
    },
    {
      number: 5,
      title: t("guide.step5.title"),
      description: t("guide.step5.description"),
    },
    {
      number: 6,
      title: t("guide.step6.title"),
      description: t("guide.step6.description"),
    },
  ]

  const tips = [t("guide.tips.tip1"), t("guide.tips.tip2"), t("guide.tips.tip3"), t("guide.tips.tip4")]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-4xl">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">{t("guide.title")}</h1>
        <p className="text-base sm:text-lg text-muted-foreground text-balance">{t("guide.subtitle")}</p>
      </div>

      <div className="space-y-6 sm:space-y-8 mb-12">
        {steps.map((step) => (
          <Card key={step.number} className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl sm:text-2xl font-bold">
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  {t("guide.step")} {step.number}: {step.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground text-pretty">{step.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 sm:p-8 mb-8 sm:mb-12 bg-muted/50">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("guide.tips.title")}</h2>
        <ul className="space-y-3 sm:space-y-4">
          {tips.map((tip, index) => (
            <li key={index} className="text-sm sm:text-base text-pretty">
              {tip}
            </li>
          ))}
        </ul>
      </Card>

      <div className="text-center">
        <p className="text-base sm:text-lg mb-4 sm:mb-6">{t("guide.cta")}</p>
        <Link href="/create">
          <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto">
            {t("nav.createEvent")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
