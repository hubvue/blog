
export interface ConfigurableWindow {
  window?: Window
}

export const tuple = <T extends unknown>(...args: T[]) => args