'use strict'

const Candidate = use('App/Models/Candidate')
const Recruiter = use('App/Models/Recruiter')
const User = use('App/Models/User')
const Role = use('App/Models/Role')

const Database = use('Database');

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
  async index ({ auth, request, response, view }) {
    const recruiter = await ( await auth.getUser() ).recruiter().first()

    try {
      let candidates = {}
      
      if(recruiter !== null){
        candidates = await recruiter.candidates().fetch()
      }
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
  async store ({ auth, request, response }) {
    const { name } = request.only(['name'])
    const recruiter = await ( await auth.getUser() ).recruiter().first()

    let candidate = {}
    let message = 'The candidate was created successfully'
    let status = 201

    try {
      if(recruiter !== null){
        candidate = await Candidate.create({
          name,
          recruiter_id: recruiter.id
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
  async show ({ auth, params, request, response, view }) {
    const { id } = params
    const recruiter = await ( await auth.getUser() ).recruiter().first()

    let candidate = {}
    let message = 'The candidate was found successfully'
    let status = 200

    try {      
      candidate = await recruiter.candidates().where('id', id).first()
      
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
  async update ({ auth, params, request, response }) {
    const { id } = params
    const { name } = request.only(['name'])
    const recruiter = await ( await auth.getUser() ).recruiter().first()

    let candidate = {}
    let message = 'The candidate was updated'
    let status = 200

    try {
      candidate = await recruiter.candidates().where('id', id).first()
      
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
  async destroy ({ auth, params, request, response }) {
    const { id } = params
    const recruiter = await ( await auth.getUser() ).recruiter().first()

    let candidate = {}
    let message = 'The candidate was deleted'
    let status = 200

    try {
      candidate = await recruiter.candidates().where('id', id).first()

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
