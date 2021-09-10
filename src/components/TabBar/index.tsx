import React, { FC } from 'react'
import { Link } from "gatsby"
import { useSwitchTheme } from '../../hooks/useSwitchTheme'
import { Icon } from '@iconify/react'
import './index.css'

interface PathMeta {
  path: string
  icon?: string
}
const NAME_TO_META: Record<string, PathMeta> = {
  'Blog': {
    path: '/blog',
  },
  'Algorithm': {
    path: '/algorithm'
  },
  'Notes': {
    path: '/book-notes'
  },
  'Essay': {
    path: '/essay'
  },
  'Github': {
    path: 'https://github.com/hubvue',
    icon: 'uil:github-alt'
  }
}

const TabBar: FC = () => {

  const { theme, switchTheme } = useSwitchTheme()

  const nssElement = Object.keys(NAME_TO_META).map(name => {
    const icon = NAME_TO_META[name].icon
    let element = <span>{name}</span>
    if (icon) {
      element = <Icon className="text-xl mt-0.5" icon={icon} />
    }
    return <Link className="mr-4" to={NAME_TO_META[name].path} key={name}>{element}</Link>
  })
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