'use strict'

class UpdateCandidate {
  get rules () {
    return {
      name: 'required|max:80',
    }
  }
}

module.exports = UpdateCandidate
