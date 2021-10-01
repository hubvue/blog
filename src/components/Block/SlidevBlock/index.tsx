import React, { FC, useState, useRef } from "react"
import { Carousel } from 'antd'
import { CarouselRef } from 'antd/lib/carousel'
import { Icon } from '@iconify/react'
import './index.css'

const STEP_ICONS = {
  forward: 'ant-design:step-forward-filled',
  back: 'ant-design:step-backward-filled'
}
const AUTOPLAY_ICONS = {
  suspend: 'ant-design:caret-left-filled',
  pause: 'ant-design:pause-outlined'
}

const Slidev: FC<any> = ({children}) => {
  const paths = collectImagePath(children)
  const slideTotal = paths.length
  const imgElements = paths.map(path => {
    return <img src={path} key={path}/>
  })

  const [ currentSlide, setCurrentSlide ] = useState(0)
  const [ autoplay, setAutoplay ] = useState(false)

  const autoplayHandler = () => {
    setAutoplay(!autoplay)
  }
  const beforeChangeHandler = (_: number, nextSlide: number) => {
    setCurrentSlide(nextSlide)
  }

  let slider = useRef<CarouselRef>(null)
  const actionStep = (action: 'prev' | 'next') => {
    return () => {
      if (slider.current) {
        slider.current[action]()
      }
    }
  }
  return <>
  <div className="slidev border border-current bg-gray-600">
    <Carousel
      ref={slider}
      autoplay={autoplay}
      dots={false} 
      beforeChange={beforeChangeHandler}
    >
      {imgElements}
    </Carousel>
    <div className="control flex justify-between items-center px-4 py-2 bg-gray-800">
      <div className="cursor-pointer text-white" onClick={autoplayHandler}>
        <Icon className="text-2xl" icon={autoplay ? AUTOPLAY_ICONS.pause : AUTOPLAY_ICONS.suspend}/>
      </div>
      <div className="step flex items-center text-white">
        <Icon className="text-xl cursor-pointer mr-3" onClick={actionStep('prev')} icon={STEP_ICONS.back} />
        <span className="text-sm">{currentSlide + 1}/{slideTotal}</span>
        <Icon className="text-xl cursor-pointer ml-3" onClick={actionStep('next')} icon={STEP_ICONS.forward} />
      </div>
    </div>
  </div>
  </>
}

function collectImagePath(children: any[]): string[] {
  const imagesPath: string[] = []
  function dps(node: any) {
    if (node.props.originalType === 'a') {
      imagesPath.push(node.props.href)
      return
    }
    const children = node.props.children
    if (children && children.length) {
      for (let i = 0; i < children.length; i ++) {
        if (children[i].$$typeof && children[i].props) {
          dps(children[i])
        }
      }
    }
  }

  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i ++) {
      if (children[i].$$typeof && children[i].props) {
        dps(children[i])
      }
    }
  }
  return imagesPath
}

export default Slidev
