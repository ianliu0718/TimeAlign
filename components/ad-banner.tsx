"use client"

import React, { useEffect } from "react"

// Bottom ad banner displayed across the entire site.
// Customize via environment variables at build time:
// - NEXT_PUBLIC_AD_BANNER_TEXT: the banner text
// - NEXT_PUBLIC_AD_BANNER_URL: optional URL to wrap the text
export function AdBanner() {
  const text = process.env.NEXT_PUBLIC_AD_BANNER_TEXT || "您的廣告在這裡"
  const url = process.env.NEXT_PUBLIC_AD_BANNER_URL
  const adScriptUrl = process.env.NEXT_PUBLIC_AD_PROVIDER_SCRIPT_URL
  const adSlotId = process.env.NEXT_PUBLIC_AD_SLOT_ID || "ad-slot-bottom"
  const donateUrl = process.env.NEXT_PUBLIC_DONATE_URL
  const donateText = process.env.NEXT_PUBLIC_DONATE_TEXT || "Donate"

  // Lazy-load external ad script once if provided
  useEffect(() => {
    if (!adScriptUrl) return
    const existing = document.querySelector(`script[data-ad-provider='bottom']`)
    if (existing) return
    const s = document.createElement("script")
    s.src = adScriptUrl
    s.async = true
    s.crossOrigin = "anonymous"
    s.setAttribute("data-ad-provider", "bottom")
    document.body.appendChild(s)
    return () => {
      // keep script for subsequent navigations; no cleanup
    }
  }, [adScriptUrl])

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Left: Ad slot or fallback text */}
          <div className="flex-1 min-w-0">
            {adScriptUrl ? (
              <div id={adSlotId} className="ad-slot w-full overflow-hidden text-center">
                {/* External ad provider should target this container via script */}
              </div>
            ) : url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate inline-block max-w-full"
                title={text}
              >
                {text}
              </a>
            ) : (
              <span className="text-muted-foreground truncate inline-block max-w-full" title={text}>
                {text}
              </span>
            )}
          </div>

          {/* Right: Donate area */}
          {donateUrl && (
            <a
              href={donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M12 21s-6-4.35-9-7.35C1.5 12.15 1 10.8 1 9.5 1 6.46 3.46 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.54 4 21 6.46 21 9.5c0 1.3-.5 2.65-2 4.15C18 16.65 12 21 12 21z" />
              </svg>
              <span>{donateText}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
