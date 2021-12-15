import React, { FC } from "react"
import { toUpperCase } from "../../utils/strings"

interface Props {
  title: string
  subTitle?: string
}

const Bio: FC<Props> = ({ title, subTitle }) => {
  return (
    <div className="prose m-auto mb-8">
      <h1>{toUpperCase(title)}</h1>
      { subTitle ? <div className="opacity-50 -mt-6 italic">{subTitle}</div> : '' }
    </div>
  )
}

export default Bio
