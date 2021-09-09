import { useMediaQuery } from "./useMediaQuery"
import { ConfigurableWindow } from "./types"

export const usePreferredDark = (options?: ConfigurableWindow) => {
  return useMediaQuery('(prefers-color-scheme: dark)', options)
}