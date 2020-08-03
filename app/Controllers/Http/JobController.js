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
   * Show a list of all jobs.
   * GET jobs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
    const { recruiter_id, candidate_id } = request.only(['recruiter_id', 'candidate_id'])

    try {
      //First lets find that recruiter
      const recruiter = await Recruiter.find(recruiter_id)
      const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id //Find the permission id
      let jobs = {} 

      if(recruiter !== null){
        //Lets find that candidate
        let candidate = await recruiter.candidates().where('id', candidate_id).first()

        //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
        if(candidate === null){
          const permission = await Permission.query().where('recruiter_id', recruiter_id).where('permission_type_id', permission_type_id).first()

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
   * POST jobs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const { title, description, recruiter_id, candidate_id } = 
      request.only(['recruiter_id', 'candidate_id', 'title', 'description'])

    let job = {}
    let message = 'The job was created successfully'
    let status = 201

    try {
      //Lets find if the recruiter_id exists
      const recruiter = await Recruiter.find(recruiter_id)
      const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id //Find the permission id

      if(recruiter !== null){
        //Lets find now if the candidate exists
        let candidate = await recruiter.candidates().where('id', candidate_id).first()

        //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
        if(candidate === null){
          const permission = await Permission.query().where('recruiter_id', recruiter_id).where('permission_type_id', permission_type_id).first()

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
            recruiter_id
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
   * GET jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
    const { recruiter_id, candidate_id } = request.only(['recruiter_id', 'candidate_id'])
    const { id } = params

    let job = {}
    let message = 'The job was found successfully'
    let status = 200

    try {      
      const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id //Find the permission id

      //Lets find if that recruiter has that candidate first
      let candidate = await Candidate.query().where('id', candidate_id).where('recruiter_id', recruiter_id).first()

      //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
      if(candidate === null){
        const permission = await Permission.query().where('recruiter_id', recruiter_id).where('permission_type_id', permission_type_id).first()

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
   * PUT or PATCH jobs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const { title, description, recruiter_id, candidate_id } = 
      request.only(['recruiter_id', 'candidate_id', 'title', 'description'])
    const { id } = params

    let job = {}
    let message = 'The job was updated'
    let status = 200

    try {
      const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id //Find the permission id

      //Lets find if that recruiter has that candidate first
      let candidate = await Candidate.query().where('id', candidate_id).where('recruiter_id', recruiter_id).first()

      //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
      if(candidate === null){
        const permission = await Permission.query().where('recruiter_id', recruiter_id).where('permission_type_id', permission_type_id).first()

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
  async destroy ({ params, request, response }) {
    const { recruiter_id, candidate_id } = request.only(['recruiter_id', 'candidate_id'])
    const { id } = params

    let job = {}
    let message = 'The job was deleted'
    let status = 200

    try {
      const permission_type_id = (await PermissionType.findBy('table_name', 'Jobs')).id //Find the permission id

      //Lets find if that recruiter has that candidate first
      let candidate = await Candidate.query().where('id', candidate_id).where('recruiter_id', recruiter_id).first()

      //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
      if(candidate === null){
        const permission = await Permission.query().where('recruiter_id', recruiter_id).where('permission_type_id', permission_type_id).first()

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
