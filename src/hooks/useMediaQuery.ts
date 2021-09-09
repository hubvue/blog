import { useEffect, useState } from "react"
import { DEFAULT_WINDOW } from "./consts"
import { ConfigurableWindow } from "./types"
export const useMediaQuery = (query: string, options: ConfigurableWindow = {}) => {
  const [ matchs, setMediaQuery ] = useState<boolean>(false)
  const { window = DEFAULT_WINDOW } = options
  if (!window) {
    return matchs
  }
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMediaQuery(mediaQuery.matches)
    const handler = (event: MediaQueryListEvent) => {
      setMediaQuery(event.matches)
    }

    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', handler)
    } else {
      mediaQuery.addListener(handler)
    }
    return () => {
      if ('removeEventListener' in mediaQuery) {
        mediaQuery.removeEventListener('change', handler)
      } else {
        mediaQuery.removeListener(handler)
      }
    }
  })
  return matchs
}