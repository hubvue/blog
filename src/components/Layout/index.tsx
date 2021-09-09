import React, { FC } from "react"
import TabBar from '../TabBar'

const Layout: FC = ({ children }) => {
  return (
    <>
      <TabBar />
      <main className="px-7 py-10">
        {children}
      </main>
    </>
  )
}

export default Layout
