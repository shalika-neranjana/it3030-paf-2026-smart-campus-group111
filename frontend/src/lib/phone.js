export const normalizePhone = (value) => value.replace(/\D/g, '').slice(0, 10)

export const formatSriLankanPhoneInput = (value) => {
  const digits = normalizePhone(value)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

export const isValidSriLankanMobile = (value) => {
  const digits = normalizePhone(value)
  return /^07\d{8}$/.test(digits)
}
