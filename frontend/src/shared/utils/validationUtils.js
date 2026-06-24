export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) return false
  const domain = email.split('@')[1]?.toLowerCase()
  return domain === 'library.com' || domain === 'gmail.com'
}

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== ''
}
