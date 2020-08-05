'use strict'

class StorePermission {
  get rules () {
    return {
      recruiter_id: 'required|integer',
      recruiter_id_from: 'required|integer',
      candidate_id: 'required|integer',
      permission_type_id: 'required|integer',
    }
  }
}

module.exports = StorePermission
