import React, { FC, ReactNode } from "react"
import { Link } from "gatsby"

interface Location {
  pathname: string
}
interface Props {
  location: Location
  title: string
  children: ReactNode[]
}

const Layout: FC<Props> = ({ location, title, children }) => {
  const isRootPath = location.pathname === `${__PATH_PREFIX__}/`
  const Header = isRootPath ?
  (
    <h1 className="main-heading">
      <Link to="/">{title}</Link>
    </h1>
  ):(
    <Link className="header-link-home" to="/">
      {title}
    </Link>
  )
  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{Header}</header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Kim
        {` `}
      </footer>
    </div>
  )
}

export default Layout
