'use strict'

const Candidate = use('App/Models/Candidate')
const Recruiter = use('App/Models/Recruiter')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with candidates
 */
class CandidateController {
  /**
   * Show a list of all candidates.
   * GET candidates
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
    const { recruiter_id } = request.only(['recruiter_id'])

    try {
      //We can only show his candidates
      const candidates = await Candidate.query().where('recruiter_id', recruiter_id).fetch()
      return response.type(200).json(candidates)

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when getting all the candidates',
        error
      })
    }
  }

  /**
   * Create/save a new candidate.
   * POST candidates
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const { name, recruiter_id } = request.only(['name', 'recruiter_id'])

    let candidate = {}
    let message = 'The candidate was created successfully'
    let status = 201

    try {
      //Lets find if the recruiter_id exists
      const recruiter = await Recruiter.find(recruiter_id)

      if(recruiter !== null){
        candidate = await Candidate.create({
          name,
          recruiter_id
        })

      }else{
        message = 'The recruiter was not found, could not create a candidate'
        status = 404
      }
      
    } catch (error) {
      return response.status(500).json({
        message: 'The candidate could not be created',
        error
      })      
    }

    return response.status(status).json({
      message,
      candidate
    })
  }

  /**
   * Display a single candidate.
   * GET candidates/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
    const { recruiter_id } = request.only(['recruiter_id'])
    const { id } = params

    let candidate = {}
    let message = 'The candidate was found successfully'
    let status = 200

    try {      
      candidate = await Candidate.query().where('id', id).where('recruiter_id', recruiter_id).first()
      
      if(candidate === null){
        message = 'The candidate was not found'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when searching a candidate',
        error
      })  
    }
  
    return response.status(status).json({
      message,
      candidate
    })
  }

  /**
   * Update candidate details.
   * PUT or PATCH candidates/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const { id } = params
    const { name, recruiter_id } = request.only(['name', 'recruiter_id'])

    let candidate = {}
    let message = 'The candidate was updated'
    let status = 200

    try {
      candidate = await Candidate.query().where('id', id).where('recruiter_id', recruiter_id).first()
      
      if(candidate !== null){
        candidate.merge({ name }) //Here we would pass all the atributes to update/change, trying not to iterate or do a 'objetct.attribute = '...
        await candidate.save()
        
      }else{
        message = 'The candidate you tried to edit doesn\'t exist'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when updating a candidate',
        error
      }) 
    }

    return response.status(status).json({
      message,
      candidate
    })
  }

  /**
   * Delete a candidate with id.
   * DELETE candidates/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
    const { id } = params
    const { recruiter_id } = request.only(['recruiter_id'])

    let candidate = {}
    let message = 'The candidate was deleted'
    let status = 200

    try {
      candidate = await Candidate.query().where('id', id).where('recruiter_id', recruiter_id).first()

      if(candidate !== null){
        await candidate.delete()
        
      }else{
        message = 'The candidate you tried to delete doesn\'t exists'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when deleting a candidate',
        error
      }) 
    }

    return response.status(status).json({
      message,
      candidate
    })
  }
}

module.exports = CandidateController
