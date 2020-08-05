'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Candidate = use('App/Models/Candidate')
const Recruiter = use('App/Models/Recruiter')

class RecruiterAuthVariant {
  /**
   * 
   * This middleware aims to allow recruiters and coaches
   * to access the route
   * 
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, params, request, response }, next) {
    const user = await auth.getUser()
    const roleName = (await user.role().first()).name
    let request_succes = false
    
    //Check if he is a recruiter
    if(roleName == "Recruiter"){
      // call next to advance the request
      await next()
    }else{
      //If he is not a recruiter, check if he is a coach
      if(roleName == "Coach"){
        const { candidate_id } = params
        //Obtain the coach from auth
        const coach = await ( await auth.getUser() ).coach().first()

        //Find the candidate
        const candidate = await Candidate.find(candidate_id)

        if(candidate !== null){
          //Obtain the candidate's recruiter
          let recruiter = await candidate.recruiter().first()

          if(recruiter !== null){
            //Check if the coach has that recruiter
            recruiter = await coach.recruiters().where('recruiter_id', recruiter.id).first()

            if(recruiter !== null){
              //The coach has the candidate, so let him go thru
              request_succes = true
              request.middleware_coach = true              
              request.middleware_recruiter_id = recruiter.id              
              await next()
            }
          }
        }
      }

      if(!request_succes){
        return response.status(403).json({
          message: 'You don\'t have the permission to use this resource'
        })
      }
    }  
  }
}

module.exports = RecruiterAuthVariant
