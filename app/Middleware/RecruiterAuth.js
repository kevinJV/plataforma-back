'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class RecruiterAuth {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, request, response }, next) {
    const user = await auth.getUser()
    const roleName = (await user.role().first()).name
    
    if(roleName == "Recruiter"){
      // call next to advance the request
      await next()
    }else{
      return response.status(403).json({
        message: 'You don\'t have the permission to use this resource'
      }) 
    }
    
  }
}

module.exports = RecruiterAuth
