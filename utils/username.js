
const USERNAME_unit = /^@[a-zA-Z0-9]+(_[a-zA-Z0-9]+)*$/

export function isValidUsernameFormat(username) {
  if (typeof username !== 'string') return false
  if (username.length < 4) return false 
  return USERNAME_unit.test(username)
}

export function normalizeUsername(raw) {
  if (typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
}
