export const toUpperCase = (s: string) => {
  return `${s.substr(0, 1).toUpperCase()}${s.substr(1).toLowerCase()}`
}