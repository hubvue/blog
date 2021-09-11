import React, { FC } from 'react'
import { Link } from "gatsby"
import { Icon } from '@iconify/react'
import ToggleTheme from '../ToggleTheme'
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
  },
  'Email': {
    path: 'mailto:cckcc.kim@gmail.com',
    icon: 'ic:outline-email'
  }
}

const TabBar: FC = () => {
  const nssElement: (JSX.Element | React.FC<{}>)[] = Object.keys(NAME_TO_META).map(name => {
    const icon = NAME_TO_META[name].icon
    const path = NAME_TO_META[name].path
    let element = <span>{name}</span>
    if (icon) {
      element = <Icon className="text-xl mt-0.5" icon={icon} />
    }
    if (path.includes('http') || path.includes('mailto')) {
      return <a className="mr-4" target="_blank" href={path} key={name}>{element}</a>
    }
    return <Link className="mr-4" to={path} key={name}>{element}</Link>
  })
  return (
    <header className="px-8 py-6">
      <div className="logo fixed left-0 top-0">
        <Link to="/"><span className="logo-title">Kim</span></Link>
      </div>
      <nav className="nav flex justify-end py-2">
        {nssElement}
        <ToggleTheme />
      </nav>
    </header>
  )
}

export default TabBar