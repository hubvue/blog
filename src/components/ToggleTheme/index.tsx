import React, { FC, useEffect, useState } from "react"
import { useSwitchTheme } from "../../hooks/useSwitchTheme"
import { Icon } from "@iconify/react"

const ToggleTheme: FC = () => {
  const { theme, switchTheme } = useSwitchTheme()
  const [isDark, setDark] = useState<boolean>(theme === "dark")
  useEffect(() => {
    if (theme === "dark") {
      setDark(true)
    } else {
      setDark(false)
    }
  }, [theme])

  const switchThemeHandler = () => {
    switchTheme()
  }
  return (
    <a className="mr-4" onClick={switchThemeHandler}>
      {isDark ? (
        <Icon className="text-xl mt-0.5" icon="ri:moon-line" />
      ) : (
        <Icon className="text-xl mt-0.5" icon="ri:sun-line" />
      )}
    </a>
  )
}

export default ToggleTheme
