
export interface ConfigurableWindow {
  window?: Window
}

export const tuple = <T extends any>(...args: T[]) => args