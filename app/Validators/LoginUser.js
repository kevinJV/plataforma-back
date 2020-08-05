'use strict'

class LoginUser {
  get rules () {
    return {
      email: 'required|max:80',
      password: 'required|max:60'
    }
  }

  get sanitizationRules () {
    return {
      email: 'normalize_email'
    }
  }
}

module.exports = LoginUser
