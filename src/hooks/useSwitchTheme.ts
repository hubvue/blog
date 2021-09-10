import { useEffect, useState } from "react"
import { usePreferredDark } from "./usePreferredDark"
import { useStore } from "./useStore"

export const useSwitchTheme = () => {
  const isDark = usePreferredDark()
  const [ colorTheme, setColorTheme ] = useStore('color-theme')

  const [theme, setTheme] = useState<string>(colorTheme)

  useEffect(() => {
    if(!colorTheme) {
      setColorTheme(isDark ? 'dark' : 'light')
      setTheme(isDark ? 'dark' : 'light')
    }
  }, [isDark])
  
  const switchTheme = (changedTheme?: 'dark' | 'light') => {
    if (changedTheme) {
      setTheme(changedTheme)
      return
    }
    if (theme === 'dark') {
      setTheme('light')
      setColorTheme('light')
    } else {
      setTheme('dark')
      setColorTheme('dark')
    }
  }
  let htmlElement: HTMLElement | null = null
  let bodyElement: HTMLElement | null = null 
  if (typeof document !== 'undefined') {
    htmlElement = document.querySelector('html')
    bodyElement = document.querySelector('body')
  }
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