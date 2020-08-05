'use strict'

class UpdateNote {
  get rules () {
    return {
      title: 'required|max:80',
      description: 'required|max:255',
    }
  }
}

module.exports = UpdateNote
