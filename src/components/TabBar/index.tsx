import React, { FC } from 'react'
import { Link } from "gatsby"
import { useSwitchTheme } from '../../hooks/useSwitchTheme'
import './index.css'

const NAME_TO_PATH: Record<string, string> = {
  'Blog': '/blog',
  'Algorithm': '/algorithm',
  'Notes': '/book-notes',
  'Essay': '/essay'
}

const TabBar: FC = () => {

  const { theme, switchTheme } = useSwitchTheme()

  const nssElement = Object.keys(NAME_TO_PATH).map(name => 
    <Link className="mr-4" to={NAME_TO_PATH[name]} key={name} >
      <span>{name}</span>
    </Link>
  )
  return (
    <header className="px-8 py-6">
      <div className="logo fixed left-0 top-0">
        <Link to="/"><span className="logo-title">Kim</span></Link>
      </div>
      <nav className="nav flex justify-end py-2">{nssElement}</nav>
    </header>
  )
}

export default TabBar