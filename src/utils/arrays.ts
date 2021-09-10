export const uniqueWithProp = <T extends Record<string, unknown>, P extends keyof T>(arr: T[], prop: P) => {
  const exists: unknown[] = []
  const res = arr.reduce((pre, item) => {
    if (!exists.includes(item[prop])) {
      exists.push(item[prop])
      pre.push(item)
    }
    return pre
  }, [] as T[])
  return res
}