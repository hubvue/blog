import React, { FC, useEffect, useState } from "react"
import ImageGallety from 'react-image-gallery'
import "react-image-gallery/styles/css/image-gallery.css"
import { StaticImage } from 'gatsby-plugin-image'

interface Props {
  code: string
}

const Slidev: FC<Props> = ({ code }) => {
  console.log(code)
  const [slidevsPath, setSlidevsPath] = useState<string[]>([])
  useEffect(() => {
    const slidevsPath = code
    .split("\n")
    .map(path => path.trim())
    .filter(path => path[0] === "-")
    .map(path => path.slice(1))
    .map(path => `../../../../${path.trim()}`)

    setSlidevsPath(slidevsPath)
  }, [code])
  if (!slidevsPath.length) {
    return <></>
  }
  return <>
    <StaticImage src="../../../../assets/title.png" alt="123"/>
  </>
}

export default Slidev
