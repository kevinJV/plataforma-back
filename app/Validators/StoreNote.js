'use strict'

class StoreNote {
  get rules () {
    return {
      title: 'required|max:80',
      description: 'required|max:255',
    }
  }
}

module.exports = StoreNote
