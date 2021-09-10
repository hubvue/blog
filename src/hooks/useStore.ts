import { useState } from "react"

export const useStore = (key: string): [string, (v: string) => any] => {
  const [ value, setValue ] = useState(global.localStorage?.getItem(key) || "")
  const setStore = (v: string) => {
    global.localStorage?.setItem(key, v)
    setValue(v)
  }
  return [value, setStore]
}