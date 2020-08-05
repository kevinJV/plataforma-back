'use strict'

class RegisterUser {
  get rules () {
    return {
      username: 'required|unique:users|max:80',
      email: 'required|email|unique:users|max:254',
      password: 'required|max:60',
      // role_id: 'required|integer'
    }
  }

  get sanitizationRules () {
    return {
      email: 'normalize_email'
    }
  }
}

module.exports = RegisterUser
