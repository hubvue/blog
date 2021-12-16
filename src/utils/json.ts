export const isJson = (value: string) => {
  if (typeof value === 'string') {
    try {
      const obj = JSON.parse(value)
      if (typeof obj === 'object' && obj) {
        return true
      }
      return false
    } catch(err) {
      return false
    }
  }
  return false
}