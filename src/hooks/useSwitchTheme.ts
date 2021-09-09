import { useEffect, useState } from "react"
import { usePreferredDark } from "./usePreferredDark"

export const useSwitchTheme = () => {
  // const isDark = usePreferredDark()
  // const [theme, setTheme] = useState<'dark' | 'light'>(isDark ? 'dark' : 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  
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
  let bodyElement: HTMLElement | null = null 
  if (typeof document !== 'undefined') {
    htmlElement = document.querySelector('html')
    bodyElement = document.querySelector('body')
  }

  // useEffect(() => {
  //   if (isDark) {
  //     setTheme('dark')
  //   } else {
  //     setTheme('light')
  //   }
  // }, [isDark])

  useEffect(() => {
    if (!htmlElement || !bodyElement) {
      return
    }
    const htmlClassList = htmlElement.classList
    const bodyClassList = bodyElement.classList
    if (theme === 'dark') {
      if (!htmlClassList.contains('dark') && !bodyClassList.contains('dark')) {
        htmlClassList.add('dark')
        bodyClassList.add('dark')
      }
    } else {
      htmlClassList.remove('dark')
      bodyClassList.remove('dark')
    }
  }, [theme])

  return {
    theme,
    switchTheme
  }
}