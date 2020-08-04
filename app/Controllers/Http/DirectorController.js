'use strict'

const Director = use('App/Models/Director')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with directors
 */
class DirectorController {
  /**
   * Show a list of all directors.
   * GET directors
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ auth, request, response, view }) {
    try {
      return response.type(200).json(await Director.all())
      
    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when getting all the directos',
        error
      })  
    }
  }

  /**
   * Create/save a new director.
   * POST directors
   *
   * ||||||||||||||||
   * |||DEPRECATED|||
   * ||||||||||||||||
   * 
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, request, response }) {
    const { name } = request.only(['name'])

    let director = {}

    try {
      director = await Director.create({
        name
      })
      
    } catch (error) {
      return response.status(500).json({
        message: 'The director could not be created',
        error
      })      
    }

    return response.status(201).send({
      message: 'The director was created successfully',
      director
    })
  }

  /**
   * Display a single director.
   * GET directors/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ auth, params, request, response, view }) {
    const { id } = params

    let director = {}
    let message = 'The director was found successfully'
    let status = 200

    try {      
      director = await Director.find(id)
      
      if(director === null){
        message = 'The director was not found'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when searching a director',
        error
      })  
    }
  
    return response.status(status).send({
      message,
      director
    })
  }


  /**
   * Update director details.
   * PUT or PATCH directors/:id
   *
   * ||||||||||||||||
   * |||DEPRECATED|||
   * ||||||||||||||||
   * 
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ auth, params, request, response }) {
    const { id } = params
    const { name } = request.only(['name'])

    let director = {}
    let message = 'The director was updated'
    let status = 200

    try {
      director = await Director.find(id)

      if(director !== null){        
        director.merge({ name }) //Here we would pass all the atributes to update/change, trying not to iterate or do a 'objetct.attribute = '...
        await director.save()

      }else{
        message = 'The director you tried to edit doesn\'t exist'
        status = 404     
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when updating a director',
        error
      }) 
    }

    return response.status(status).send({
      message,
      director
    })
  }

  /**
   * Delete a director with id.
   * DELETE directors/:id
   * 
   * ||||||||||||||||
   * |||DEPRECATED|||
   * ||||||||||||||||
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ auth, params, request, response }) {
    const { id } = params

    let director = {}
    let message = 'The director was deleted'
    let status = 200

    try {
      director = await Director.find(id)

      if(director !== null){
        await director.delete()
        
      }else{
        message = 'The director you tried to delete doesn\'t exists'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when deleting a director',
        error
      }) 
    }

    return response.status(status).send({
      message,
      director
    })
  }
}

module.exports = DirectorController
