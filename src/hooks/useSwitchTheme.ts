import { useEffect, useState } from "react"
import { usePreferredDark } from "./usePreferredDark"

export const useSwitchTheme = () => {
  const isDark = usePreferredDark()
  const [theme, setTheme] = useState<'dark' | 'light'>(isDark ? 'dark' : 'light')
  
  const switchTheme = (changedTheme?: 'dark' | 'light') => {
    if (changedTheme) {
      setTheme(changedTheme)
      return
    }
    if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }
  let htmlElement: HTMLElement | null = null
  if (document) {
    htmlElement = document.querySelector('html')
  }

  useEffect(() => {
    if (isDark) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }, [isDark])

  useEffect(() => {
    if (!htmlElement) {
      return
    }
    const classList = htmlElement.classList
    if (theme === 'dark') {
      classList.add('dark')
    } else {
      classList.remove('dark')
    }
  }, [theme])

  return {
    theme,
    switchTheme
  }
}