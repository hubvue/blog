import React, { FC, useRef, useState, useEffect } from "react"
import { navigate } from "gatsby"
import TabBar from '../TabBar'
// import 'ninja-keys'
import { useSwitchTheme } from  "../../hooks/useSwitchTheme"

// ninja-keys里用到了windows，因此在SSR时需要判断环境引入包
if (typeof window !== 'undefined') {
  require('ninja-keys')
}

interface Props {
  fullScreen?: boolean
  hideTabBar?: boolean
}
interface INinjaAction {
  id: string;
  title: string;
  hotkey?: string;
  handler?: Function;
  mdIcon?: string;
  icon?: string;
  parent?: string;
  keywords?: string;
  children?: string[];
  section?: string;
}
const Layout: FC<Props> = ({ children, fullScreen, hideTabBar }) => {
  const ninjaKeysEl = useRef<any>(null)
  const [_, switchTheme] = useSwitchTheme()
  const [hotkeys] = useState<INinjaAction[]>([
    {
      id: "Home",
      title: "Open Home",
      hotkey: "cmd+h",
      handler: () => {
        navigate('/')
      },
    }, 
    {
      id: "Blog",
      title: "Open Blog",
      hotkey: "cmd+b",
      handler: () => {
        navigate('/blog')
      },
    },
    {
      id: "Alogrithm",
      title: "Open Algorithm",
      hotkey: "cmd+a",
      handler: () => {
        navigate('/algorithm')
      },
    },
    {
      id: "Notes",
      title: "Open Notes",
      hotkey: "cmd+n",
      handler: () => {
        navigate('/notes')
      },
    },
    // {
    //   id: "Essay",
    //   title: "Open Essay",
    //   hotkey: "cmd+e",
    //   handler: () => {
    //     navigate('/essay')
    //   },
    // },
    {
      id: "Tools",
      title: "Open Tools",
      hotkey: "cmd+t",
      handler: () => {
        navigate('/tools')
      },
    },
    {
      id: "Github",
      title: "Open Github",
      hotkey: "cmd+g",
      handler: () => {
        navigate('https://github.com/hubvue')
      },
    },
    {
      id: "Theme",
      title: "Switch Theme",
      hotkey: "cmd+s",
      handler: () => {
        switchTheme()
      },
    },
  ])
  useEffect(() => {
    if (ninjaKeysEl.current) {
      ninjaKeysEl.current.data = hotkeys
    }
  }, [])
  return (
    <>
      {hideTabBar ? "" : <TabBar />}
      <main className={fullScreen ? "" : "px-7 py-10"}>
        {children}
        <ninja-keys ref={ninjaKeysEl}></ninja-keys>
      </main>
    </>
  )
}

export default Layout
