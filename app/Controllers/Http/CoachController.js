'use strict'

const Coach = use('App/Models/Coach')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with coaches
 */
class CoachController {
  /**
   * Show a list of all coaches.
   * GET coaches
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
    const { director_id } = request.only(['director_id']) //If this method were to get the id from auth, here it would change

    try {
      //We can only show his coaches
      const coaches = await Coach.query().where('director_id', director_id).fetch()
      return response.type(200).json(coaches)

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when getting all the coaches',
        error
      })
    }
  }

  /**
   * Create/save a new coach.
   * POST coaches
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const { name, director_id } = request.only(['name', 'director_id']) //We need to know which director created the coach

    let coach = {}

    try {
      coach = await Coach.create({
        name,
        director_id
      })
      
    } catch (error) {
      return response.status(500).json({
        message: 'The coach could not be created',
        error
      })      
    }

    return response.status(201).json({
      message: 'The coach was created successfully',
      coach
    })
  }

  /**
   * Display a single coach.
   * GET coaches/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
    const { director_id } = request.only(['director_id'])
    const { id } = params

    let coach = {}
    let message = 'Coach not found'

    try {      
      coach = await Coach.query().where('id', id).where('director_id', director_id).first()
      
      if(coach !== null){
        message = 'The coach was found successfully'
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when searching a coach',
        error
      })  
    }
  
    return response.status(200).json({
      message,
      coach
    })
  }

  /**
   * Update coach details.
   * PUT or PATCH coaches/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const { id } = params
    const { name, director_id } = request.only(['name', 'director_id'])

    let coach = {}

    try {
      coach = await Coach.query().where('id', id).where('director_id', director_id).first()
      
      if(coach === null){
        return response.status(404).json({
          message: 'The coach you tried to edit doesn\'t exist',
        })
      }

      coach.merge({ name }) //Here we would pass all the atributes to update/change, trying not to iterate or do a 'objetct.attribute = '...

      await coach.save()

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when updating a coach',
        error
      }) 
    }

    return response.status(200).json({
      message: 'The coach was updated',
      coach
    })
  }

  /**
   * Delete a coach with id.
   * DELETE coaches/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
    const { id } = params
    const { director_id } = request.only(['director_id'])

    let coach = {}

    try {
      coach = await Coach.query().where('id', id).where('director_id', director_id).first()

      if(coach === null){
        return response.status(404).json({
          message: 'The coach you tried to delete doesn\'t exists',          
        })
      }

      await coach.delete()

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when deleting a coach',
        error
      }) 
    }

    return response.status(200).json({
      message: 'The coach was deleted',
      coach
    })
  }
}

module.exports = CoachController
