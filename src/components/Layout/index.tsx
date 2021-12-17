import React, { FC } from "react"
import TabBar from '../TabBar'

interface Props {
  fullScreen?: boolean
  hideTabBar?: boolean
}
const Layout: FC<Props> = ({ children, fullScreen, hideTabBar }) => {
  return (
    <>
      {hideTabBar ? "" : <TabBar />}
      <main className={fullScreen ? "" : "px-7 py-10"}>
        {children}
      </main>
    </>
  )
}

export default Layout
