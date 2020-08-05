'use strict'

const Coach = use('App/Models/Coach')
const Director = use('App/Models/Director')
const User = use('App/Models/User')
const Role = use('App/Models/Role')

const Database = use('Database');

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
  async index ({ auth, request, response, view }) {
    const director = await ( await auth.getUser() ).director().first()
    const director_id = director.id

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
  async store ({ auth, request, response }) {
    const { name, email, password } = request.only(['name', 'email', 'password',])
    const director = await ( await auth.getUser() ).director().first()
    const director_id = director.id
    const role_id = (await Role.findBy('name', 'Coach')).id  

    let coach = {}
    let message = 'The coach was created successfully'
    let status = 201

    //We are gonna need a transaction
    const trx = await Database.beginTransaction()
    try {
      //First lets create a user
      const user = await User.create({
        username: name,
        email,
        password,
        role_id
      }, trx)

      //Lets create the coach for that user
      coach = await Coach.create({
        name,
        director_id,
        user_id: user.id
      }, trx)

      coach.user = user
      
      //Coach and User created, lets commit
      await trx.commit()

    } catch (error) {
      //Someting went wrong, rollback
      await trx.rollback()

      return response.status(500).json({
        message: 'The coach could not be created',
        error
      })      
    }

    return response.status(status).json({
      message,
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
  async show ({ auth, params, request, response, view }) {
    const { id } = params
    const director = await ( await auth.getUser() ).director().first()
    const director_id = director.id

    let coach = {}
    let message = 'The coach was found successfully'
    let status = 200

    try {      
      coach = await Coach.query().where('id', id).where('director_id', director_id).first()
      
      if(coach === null){
        message = 'The coach was not found'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when searching a coach',
        error
      })  
    }
  
    return response.status(status).json({
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
  async update ({ auth, params, request, response }) {
    const { id } = params
    const { name } = request.only(['name'])
    const director = await ( await auth.getUser() ).director().first()
    const director_id = director.id

    let coach = {}
    let message = 'The coach was updated'
    let status = 200

    try {
      coach = await Coach.query().where('id', id).where('director_id', director_id).first()
      
      if(coach !== null){
        coach.merge({ name }) //Here we would pass all the atributes to update/change, trying not to iterate or do a 'objetct.attribute = '...
        await coach.save()
        
      }else{
        message = 'The coach you tried to edit doesn\'t exist'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when updating a coach',
        error
      }) 
    }

    return response.status(status).json({
      message,
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
  async destroy ({ auth, params, request, response }) {
    const { id } = params
    const director = await ( await auth.getUser() ).director().first()
    const director_id = director.id

    let coach = {}
    let message = 'The coach was deleted'
    let status = 200

    try {
      coach = await Coach.query().where('id', id).where('director_id', director_id).first()

      if(coach !== null){
        await coach.delete()
        
      }else{
        message = 'The coach you tried to delete doesn\'t exists'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when deleting a coach',
        error
      }) 
    }

    return response.status(status).json({
      message,
      coach
    })
  }

  /**
   * Show the coach hierarchy.
   * GET coaches-hierarchy
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async indexHierarchy ({ auth, request, response, view }) {
    const coach = await ( await auth.getUser() ).coach().first()

    let hierarchy = {}
    let message = 'Coach hierarchy found'
    let status = 200

    try {
      hierarchy = await Coach.query()
      .where('id', coach.id)
      .with('recruiters').with('recruiters.candidates')
      .fetch()
      
    } catch (error) {
      console.log(error)
      return response.status(500).json({
        message: 'Something went wrong when getting the hierarchy',
        error
      })  
    }

    return response.status(status).json({
      message,
      hierarchy
    })
  }
}

module.exports = CoachController
