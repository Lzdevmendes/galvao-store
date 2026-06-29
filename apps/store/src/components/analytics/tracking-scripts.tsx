'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

const GA4_ID     = process.env.NEXT_PUBLIC_GA4_ID
const GTM_ID     = process.env.NEXT_PUBLIC_GTM_ID
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID

const CONSENT_KEY = 'galvao_cookie_consent'

declare global {
  interface Window {
    gtag?:    (...args: unknown[]) => void
    dataLayer?: unknown[]
    clarity?: (...args: unknown[]) => void
  }
}

export function gtagEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params)
  }
}

// LGPD: nenhum script de tracking carrega antes do consentimento explícito.
// O estado inicial é "sem consentimento"; lê-se o localStorage e ouvem-se os
// eventos disparados pelo CookieBanner (consent:analytics / consent:marketing).
export function TrackingScripts() {
  const [consent, setConsent] = useState({ analytics: false, marketing: false })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY)
      if (saved) {
        const d = JSON.parse(saved) as { analytics?: boolean; marketing?: boolean }
        setConsent({ analytics: !!d.analytics, marketing: !!d.marketing })
      }
    } catch { /* localStorage indisponível — mantém sem consentimento */ }

    const onAnalytics = () => setConsent(c => ({ ...c, analytics: true }))
    const onMarketing = () => setConsent(c => ({ ...c, marketing: true }))
    window.addEventListener('consent:analytics', onAnalytics)
    window.addEventListener('consent:marketing', onMarketing)
    return () => {
      window.removeEventListener('consent:analytics', onAnalytics)
      window.removeEventListener('consent:marketing', onMarketing)
    }
  }, [])

  // Sem consentimento de analíticos → não injeta nada (GA4/GTM/Clarity).
  if (!consent.analytics) return null

  return (
    <>
      {/* Google Tag Manager */}
      {GTM_ID && (
        <Script id="gtm-init" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}</Script>
      )}

      {/* GA4 directo (quando não tem GTM) */}
      {GA4_ID && !GTM_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}', { page_path: window.location.pathname });
          `}</Script>
        </>
      )}

      {/* Microsoft Clarity */}
      {CLARITY_ID && (
        <Script id="clarity-init" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","${CLARITY_ID}");
        `}</Script>
      )}
    </>
  )
}
