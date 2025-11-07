"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/i18n/language-context"

export function RotatingText() {
  const { t } = useLanguage()
  const [index, setIndex] = useState(0)

  const words = [
    t("rotating.meeting"),
    t("rotating.group"),
    t("rotating.event"),
    t("rotating.gathering"),
    t("rotating.party"),
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [words.length])

  return (
    <span className="inline-block min-w-[120px] text-primary font-bold animate-in fade-in duration-500" key={index}>
      {words[index]}
    </span>
  )
}
