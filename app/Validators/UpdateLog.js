'use strict'

class UpdateLog {
  get rules () {
    return {
      title: 'required|max:80',
      description: 'required|max:255',
    }
  }
}

module.exports = UpdateLog
