import React, { FC } from 'react'
import { Link } from 'gatsby'
import "./index.css"
interface Group {
  title: string
  ns: string
  group: string
  groupName: string
  description: string
  date: string
}

interface Props {
  groupList: Group[]
  prefix: string
}

const GridList: FC<Props> = ({ groupList, prefix }) => {
  return (
    <div className="prose m-auto">
      <div className="group-list py-2 -mx-3">
        {
          groupList.map(group => (
            <Link className="item relative flex" to={`${prefix}/${group.group}`} key={group.title}>
              <div></div>
              <div className="flex-auto">
                <div className="text-normal">{group.groupName}</div>
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  )
}

export default GridList