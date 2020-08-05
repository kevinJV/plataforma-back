'use strict'

const Candidate = use('App/Models/Candidate')
const Recruiter = use('App/Models/Recruiter')
const User = use('App/Models/User')
const Role = use('App/Models/Role')
const Permission = use('App/Models/Permission')

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
      
      //First lets fetch his/hers candidates
      if(recruiter !== null){
        candidates = await recruiter.candidates().fetch()

        //Now lets fetch the candidates that he has perrmissions on
        let permission_candidates = await Database.table('permissions').select('candidates.*')
          .where('permissions.recruiter_id', recruiter.id)
          .innerJoin('candidates', 'permissions.candidate_id', 'candidates.id').groupBy('candidates.id')

        //We push previous candidates into this new array
        for(let index in candidates.rows){
          permission_candidates.push(candidates.rows[index].toJSON())
        }

        candidates = permission_candidates
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

      //If the recruiter doesn't have that candidate in his list, lets see if he has the permission
      if(candidate === null){
        //Only works if you (RECRUITER) have the exact PERMISSION in this CANDIDATE
        const permission = await Permission.query()
          .where('recruiter_id', recruiter.id).where('candidate_id', id)
          .first()

        if(permission !== null){
          //Lets give him the permission
          candidate = await Candidate.find(id)
          message = 'The candidate was found successfully but due to a permission'
        }
      }
      
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
