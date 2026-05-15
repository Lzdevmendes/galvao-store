import { useEffect } from 'react'

const BASE = "Galvão's Store"

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} · Chuteiras de Alta Performance`
  }, [title])
}
