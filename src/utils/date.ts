
export const formatDate = (rawDate: string): string => {
  const date = new Date(rawDate)
  const year = date.getFullYear()
  let month = padZero(date.getMonth() + 1, 2)
  let day = padZero(date.getDay(), 2)
  let hour = padZero(date.getHours(), 2)
  let minute = padZero(date.getMinutes(), 2)
  let second = padZero(date.getSeconds(), 2)
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const padZero = <T>(value: T, step = String(value).length): string => {
  return String(value).padStart(step, '0')
}