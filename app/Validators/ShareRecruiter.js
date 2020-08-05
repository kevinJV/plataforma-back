'use strict'

class ShareRecruiter {
  get rules () {
    return {
      recruiter_id: 'required|integer',
      coach_id_to: 'required|integer'
    }
  }
}

module.exports = ShareRecruiter
