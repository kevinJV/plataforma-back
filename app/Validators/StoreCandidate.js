'use strict'

class StoreCandidate {
  get rules () {
    return {
      name: 'required|max:80',
    }
  }
}

module.exports = StoreCandidate
