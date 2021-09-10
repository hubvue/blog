import React, { FC } from "react"
import { toUpperCase } from "../../utils/strings"

interface Props {
  title: string
}

const Bio: FC<Props> = ({ title }) => {
  return (
    <div className="prose m-auto mb-8">
      <h1>{toUpperCase(title)}</h1>
    </div>
  )
}

export default Bio
