'use strict'

class StoreRecruiter {
  get rules () {
    return {
      name: 'required|unique:users,username|max:80',
      email: 'required|email|unique:users|max:254',
      password: 'required|max:60',
    }
  }

  get sanitizationRules () {
    return {
      email: 'normalize_email'
    }
  }
}

module.exports = StoreRecruiter
