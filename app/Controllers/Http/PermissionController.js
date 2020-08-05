'use strict'

const Coach = use('App/Models/Coach')
const Permission = use('App/Models/Permission')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with permissions
 */
class PermissionController {
  /**
   * Create/save a new permission.
   * POST permissions
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, request, response }) {
    const { recruiter_id, recruiter_id_from, candidate_id, permission_type_id } = 
      request.only(['recruiter_id', 'recruiter_id_from', 'candidate_id', 'permission_type_id'])
    const coach = await ( await auth.getUser() ).coach().first()


    let permission = {}
    let message = 'Permission created'
    let status = 201

    try {
      if(coach !== null){
        //We search the recruiter that is going to have the permission
        const recruiter_to = await coach.recruiters().where('recruiter_id', recruiter_id).first()      

        if(recruiter_to !== null){
          //We search the recruiter_from where the candidate is
          const recruiter = await coach.recruiters().where('recruiter_id', recruiter_id_from).first()      

          if(recruiter !== null){
            //We search the candidate in the recruiter
            const candidate = await recruiter.candidates().where('id', candidate_id).first()

            if(candidate !== null){
              //We create the permission 
              permission = await Permission.create({
                recruiter_id,
                permission_type_id,
                coach_id: coach.id,
                candidate_id
              })

            }else{
              message = 'The candidate couldn\'t be found'
              status = 404
            }

          }else{
            message = 'The recruiter from where the permission comes from couldn\'t be found'
            status = 404
          }

        }else{
          message = 'The recruiter that is being given the permission couldn\'t be found'
          status = 404
        }        
      
      }else{
        message = 'The coach couldn\'t be found'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'The permission could not be created',
        error
      })
    }

    return response.status(status).json({
      message,
      permission
    })
  }


  /**
   * Delete a permission with id.
   * DELETE permissions/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ auth, params, request, response }) {
    const coach = await ( await auth.getUser() ).coach().first()
    const { id } = params

    let permission = {}
    let message = 'Permission deleted'
    let status = 200

    try {
      //First we need to see if there is a entry with the permission_id and the coach_id
      permission = await Permission.query().where('id', id).where('coach_id', coach.id).first()

      if(permission !== null){
        await permission.delete()

      }else{
        message = 'The permission you tried to delete doesn\'t exists'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when deleting a permission',
        error
      }) 
    }

    return response.status(status).json({
      message,
      permission
    })
  }
}

module.exports = PermissionController
