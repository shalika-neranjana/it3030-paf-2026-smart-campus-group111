const PASSWORD_RULE_TEXT = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'

const hasUppercase = /[A-Z]/
const hasLowercase = /[a-z]/
const hasDigit = /\d/
const hasSpecial = /[^A-Za-z0-9]/

export const getPasswordValidationError = (password) => {
  if (!password || password.length < 8) {
    return PASSWORD_RULE_TEXT
  }

  if (!hasUppercase.test(password)) {
    return PASSWORD_RULE_TEXT
  }

  if (!hasLowercase.test(password)) {
    return PASSWORD_RULE_TEXT
  }

  if (!hasDigit.test(password)) {
    return PASSWORD_RULE_TEXT
  }

  if (!hasSpecial.test(password)) {
    return PASSWORD_RULE_TEXT
  }

  return ''
}

export { PASSWORD_RULE_TEXT }
