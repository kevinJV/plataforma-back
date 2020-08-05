'use strict'
const Recruiter = use('App/Models/Recruiter')
const Candidate = use('App/Models/Candidate')
const Job = use('App/Models/Job')
const Permission = use('App/Models/Permission')
const PermissionType = use('App/Models/PermissionType')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with jobs
 */
class JobController {

  /**
   * This methods aim to allow coaches and recruiter 
   * to use the controller in cooperation with 
   * the middleware RecruiterAuthVariant
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   */
  async getRecruiter(request, params, auth){
    let recruiter = {}
    const { candidate_id } = params

    //Lets check if is the coach the one working
    if(request.middleware_coach){
      //We know from the middleware that the coach has the recruiter
      recruiter = await Recruiter.find(request.middleware_recruiter_id)
    }else{
      //Get the recruiter the normal way
      recruiter = await ( await auth.getUser() ).recruiter().first()
    }
    console.log(recruiter)

    return recruiter
  }

  /**
   * Show a list of all jobs.
   * GET candidates/:candidate_id/jobs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ auth, params, request, response, view }) {
    const { candidate_id } = params
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id

    try {
      let jobs = []

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
          jobs = await candidate.jobs().fetch()
        }

      }

      return response.type(200).json(jobs)

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when getting all the jobs',
        error
      })
    }
  }

  /**
   * Create/save a new job.
   * POST candidates/:candidate_id/jobs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, params, request, response }) {
    const { candidate_id } = params
    const { title, description } = request.only(['title', 'description'])
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id //Find the permission id

    let job = {}
    let message = 'The job was created successfully'
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
          //Now we can create the job
          job = await Job.create({
            title,
            description,
            candidate_id,
            recruiter_id: recruiter.id
          })

        }else{
          message = 'The candidate was not found, could not create a job'
          status = 404
        }        

      }else{
        message = 'The recruiter was not found, could not create a job'
        status = 404
      }
      
    } catch (error) {
      return response.status(500).json({
        message: 'The job could not be created',
        error
      })      
    }

    return response.status(status).json({
      message,
      job
    })
  }

  /**
   * Display a single job.
   * GET candidates/:candidate_id/jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ auth, params, request, response, view }) {
    const { candidate_id, id } = params
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id //Find the permission id

    let job = {}
    let message = 'The job was found successfully'
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
        //Now that we have the candidate, lets search that job
        job = await candidate.jobs().where('id', id).first()

        if(job === null){
          message = 'The job was not found'
          status = 404
        }

      }else{
        message = 'The candidate was not found, could not show the job'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when searching a job',
        error
      })  
    }
  
    return response.status(status).json({
      message,
      job
    })
  }

  /**
   * Update job details.
   * PUT or PATCH candidates/:candidate_id/jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ auth, params, request, response }) {
    const { candidate_id, id } = params
    const { title, description } = request.only(['title', 'description'])
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id //Find the permission id

    let job = {}
    let message = 'The job was updated'
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
        //Now that we have the candidate, lets search that job
        job = await candidate.jobs().where('id', id).first()

        if(job !== null){
          //Lets save the changes
          job.merge({ title, description })
          await job.save()

        }else{
          message = 'The job you tried to edit doesn\'t exist'
          status = 404
        }
        
      }else{
        message = 'The candidate was not found, could not update the job'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when updating a job',
        error
      }) 
    }

    return response.status(status).json({
      message,
      job
    })
  }

  /**
   * Delete a job with id.
   * DELETE jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ auth, params, request, response }) {
    const { candidate_id, id } = params
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id //Find the permission id

    let job = {}
    let message = 'The job was deleted'
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
        //Now that we have the candidate, lets search that job
        job = await candidate.jobs().where('id', id).first()

        if(job !== null){
          //If that job exists, then delete it now
          await job.delete()

        }else{
          message = 'The job you tried to delete doesn\'t exists'
          status = 404
        }
        
      }else{
        message = 'The candidate was not found, could not delete the job'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when deleting a job',
        error
      }) 
    }

    return response.status(status).json({
      message,
      job
    })
  }
}

module.exports = JobController
