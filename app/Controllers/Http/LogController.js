'use strict'
const Recruiter = use('App/Models/Recruiter')
const Candidate = use('App/Models/Candidate')
const Log = use('App/Models/Log')
const Permission = use('App/Models/Permission')
const PermissionType = use('App/Models/PermissionType')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with logs
 */
class LogController {
  /**
   * Show a list of all logs.
   * GET candidates/:candidate_id/logs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ auth, params, request, response, view }) {
    const { candidate_id } = params
    const recruiter = await ( await auth.getUser() ).recruiter().first()
    const permission_type_id = (await PermissionType.findBy('table_name', 'Logs')).id

    try {
      let logs = []

      if(recruiter !== null){
        //Lets find that candidate
        let candidate = await recruiter.candidates().where('id', candidate_id).first()

        //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
        if(candidate === null){
          //Only works if you (RECRUITER) have the exact PERMISSION in this CANDIDATE
          const permission = await Permission.query()
            .where('recruiter_id', recruiter.id).where('permission_type_id', permission_type_id).where('candidate_id', candidate_id)
            .first()

          if(permission !== null){
            //Lets give him the permission
            candidate = await Candidate.find(candidate_id)
          }
        }

        if(candidate !== null){
          logs = await candidate.logs().fetch()
        }

      }

      return response.type(200).json(logs)

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when getting all the logs',
        error
      })
    }
  }

  /**
   * Create/save a new log.
   * POST candidates/:candidate_id/logs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, params, request, response }) {
    const { candidate_id } = params
    const { title, description } = request.only(['title', 'description'])
    const recruiter = await ( await auth.getUser() ).recruiter().first()
    const permission_type_id = (await PermissionType.findBy('table_name', 'Logs')).id //Find the permission id

    let log = {}
    let message = 'The log was created successfully'
    let status = 201

    try {
      if(recruiter !== null){
        //Lets find now if the candidate exists
        let candidate = await recruiter.candidates().where('id', candidate_id).first()

        //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
        if(candidate === null){
          //Only works if you (RECRUITER) have the exact PERMISSION in this CANDIDATE
          const permission = await Permission.query()
            .where('recruiter_id', recruiter.id).where('permission_type_id', permission_type_id).where('candidate_id', candidate_id)
            .first()

          if(permission !== null){
            //Lets give him the permission
            candidate = await Candidate.find(candidate_id)
          }
        }

        if(candidate !== null){
          //Now we can create the log
          log = await Log.create({
            title,
            description,
            candidate_id,
            recruiter_id: recruiter.id
          })

        }else{
          message = 'The candidate was not found, could not create a log'
          status = 404
        }        

      }else{
        message = 'The recruiter was not found, could not create a log'
        status = 404
      }
      
    } catch (error) {
      return response.status(500).json({
        message: 'The log could not be created',
        error
      })      
    }

    return response.status(status).json({
      message,
      log
    })
  }

  /**
   * Display a single log.
   * GET candidates/:candidate_id/logs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ auth, params, request, response, view }) {
    const { candidate_id, id } = params
    const recruiter = await ( await auth.getUser() ).recruiter().first()
    const permission_type_id = (await PermissionType.findBy('table_name', 'Logs')).id //Find the permission id

    let log = {}
    let message = 'The log was found successfully'
    let status = 200

    try {      
      //Lets find if that recruiter has that candidate first
      let candidate = await recruiter.candidates().where('id', candidate_id).first()

      //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
      if(candidate === null){
        //Only works if you (RECRUITER) have the exact PERMISSION in this CANDIDATE
        const permission = await Permission.query()
          .where('recruiter_id', recruiter.id).where('permission_type_id', permission_type_id).where('candidate_id', candidate_id)
          .first()

        if(permission !== null){
          //Lets give him the permission
          candidate = await Candidate.find(candidate_id)
        }
      }
      
      if(candidate !== null){
        //Now that we have the candidate, lets search that log
        log = await candidate.logs().where('id', id).first()

        if(log === null){
          message = 'The log was not found'
          status = 404
        }

      }else{
        message = 'The candidate was not found, could not show the log'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when searching a log',
        error
      })  
    }
  
    return response.status(status).json({
      message,
      log
    })
  }

  /**
   * Update log details.
   * PUT or PATCH candidates/:candidate_id/logs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ auth, params, request, response }) {
    const { candidate_id, id } = params
    const { title, description } = request.only(['title', 'description'])
    const recruiter = await ( await auth.getUser() ).recruiter().first()
    const permission_type_id = (await PermissionType.findBy('table_name', 'Logs')).id //Find the permission id

    let log = {}
    let message = 'The log was updated'
    let status = 200

    try {
      //Lets find if that recruiter has that candidate first
      let candidate = await recruiter.candidates().where('id', candidate_id).first()

      //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
      if(candidate === null){
        //Only works if you (RECRUITER) have the exact PERMISSION in this CANDIDATE
        const permission = await Permission.query()
          .where('recruiter_id', recruiter.id).where('permission_type_id', permission_type_id).where('candidate_id', candidate_id)
          .first()

        if(permission !== null){
          //Lets give him the permission
          candidate = await Candidate.find(candidate_id)
        }
      }
      
      if(candidate !== null){
        //Now that we have the candidate, lets search that log
        log = await candidate.logs().where('id', id).first()

        if(log !== null){
          //Lets save the changes
          log.merge({ title, description })
          await log.save()

        }else{
          message = 'The log you tried to edit doesn\'t exist'
          status = 404
        }
        
      }else{
        message = 'The candidate was not found, could not update the log'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when updating a log',
        error
      }) 
    }

    return response.status(status).json({
      message,
      log
    })
  }

  /**
   * Delete a log with id.
   * DELETE logs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ auth, params, request, response }) {
    const { candidate_id, id } = params
    const recruiter = await ( await auth.getUser() ).recruiter().first()
    const permission_type_id = (await PermissionType.findBy('table_name', 'Logs')).id //Find the permission id

    let log = {}
    let message = 'The log was deleted'
    let status = 200

    try {
      //Lets find if that recruiter has that candidate first
      let candidate = await recruiter.candidates().where('id', candidate_id).first()

      //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
      if(candidate === null){
        //Only works if you (RECRUITER) have the exact PERMISSION in this CANDIDATE
        const permission = await Permission.query()
          .where('recruiter_id', recruiter.id).where('permission_type_id', permission_type_id).where('candidate_id', candidate_id)
          .first()

        if(permission !== null){
          //Lets give him the permission
          candidate = await Candidate.find(candidate_id)
        }
      }

      if(candidate !== null){
        //Now that we have the candidate, lets search that log
        log = await candidate.logs().where('id', id).first()

        if(log !== null){
          //If that log exists, then delete it now
          await log.delete()

        }else{
          message = 'The log you tried to delete doesn\'t exists'
          status = 404
        }
        
      }else{
        message = 'The candidate was not found, could not delete the log'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when deleting a log',
        error
      }) 
    }

    return response.status(status).json({
      message,
      log
    })
  }
}

module.exports = LogController
