'use strict'

class UpdateRecruiter {
  get rules () {
    return {
      name: 'required|max:80',
    }
  }
}

module.exports = UpdateRecruiter
