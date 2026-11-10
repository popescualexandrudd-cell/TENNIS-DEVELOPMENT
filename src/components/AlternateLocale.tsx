'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Ctx = { href: string | null; set: (href: string | null) => void }
const AlternateContext = createContext<Ctx>({ href: null, set: () => {} })

/** Permite unei pagini (ex. articol) să indice traducerea ei exactă selectorului de limbă. */
export function AlternateProvider({ children }: { children: ReactNode }) {
  const [href, set] = useState<string | null>(null)
  return <AlternateContext.Provider value={{ href, set }}>{children}</AlternateContext.Provider>
}

export function SetAlternate({ href }: { href: string | null }) {
  const { set } = useContext(AlternateContext)
  useEffect(() => {
    set(href)
    return () => set(null)
  }, [href, set])
  return null
}

export function useAlternateOverride() {
  return useContext(AlternateContext).href
}
