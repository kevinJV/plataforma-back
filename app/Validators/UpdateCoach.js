'use strict'

class UpdateCoach {
  get rules () {
    return {
      name: 'required|max:80',
    }
  }
}

module.exports = UpdateCoach
