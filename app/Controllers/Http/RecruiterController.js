'use strict'

const Recruiter = use('App/Models/Recruiter')
const Coach = use('App/Models/Coach')
const User = use('App/Models/User')
const Role = use('App/Models/Role')

const Database = use('Database');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with recruiters
 */
class RecruiterController {
  /**
   * Show a list of all recruiters.
   * GET recruiters
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ auth, request, response, view }) {
    const coach = await ( await auth.getUser() ).coach().first()

    try {
      let recruiters = {}
      
      if(coach !== null){
        //Get its recruiters
        recruiters = await coach.recruiters().fetch()      
      }

      //We can only show his recruiters
      return response.type(200).json(recruiters)

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when getting all the recruiters',
        error
      })
    }
  }

  /**
   * Create/save a new recruiter.
   * POST recruiters
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, request, response }) {
    const { name, email, password } = request.only(['name', 'email', 'password',])
    const coach = await ( await auth.getUser() ).coach().first()
    const role_id = (await Role.findBy('name', 'Recruiter')).id  

    let recruiter = {}

    //Lets start a transaction since we have to create a recruiter and then make an insert in the pivot table
    const trx = await Database.beginTransaction()
    try {
      if(coach === null){
        throw 'The coach could not be found, transaction rolledback'
      }

      //First lets create a user
      const user = await User.create({
        username: name,
        email,
        password,
        role_id
      }, trx)

      //Create the recruiter
      recruiter = await Recruiter.create({ 
        name,
        user_id: user.id       
      }, trx)

      //Attach or create de pivot insert
      await coach.recruiters().attach([recruiter.id], null, trx)

      //Commit the transaction
      await trx.commit()

    } catch (error) {
      //Cancel the transaction
      await trx.rollback()

      return response.status(500).json({
        message: 'The recruiter could not be created',
        error
      })
    }

    return response.status(201).json({
      message: 'The recruiter was created successfully',
      recruiter
    })
  }

  /**
   * Display a single recruiter.
   * GET recruiters/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ auth, params, request, response, view }) {
    const { id } = params
    const coach = await ( await auth.getUser() ).coach().first()

    let recruiter = {}
    let message = 'The recruiter was found successfully'
    let status = 200

    try {
      if(coach !== null){
        //Now that we have the couch, we can search in its recruiters if the recruiter_id exists
        recruiter = await coach.recruiters().where('recruiter_id', id).first() //doesn't scape the couch scope        
  
        if(recruiter === null){
          message = 'The recruiter could not be found'
          status = 404
        }

      }else{
        message = 'The coach could not be found'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when searching a recruiter',
        error
      })
    }

    return response.status(status).json({
      message,
      recruiter
    })
  }

  /**
   * Update recruiter details.
   * PUT or PATCH recruiters/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ auth, params, request, response }) {
    const { id } = params
    const { name } = request.only(['name'])
    const coach = await ( await auth.getUser() ).coach().first()

    let recruiter = {}
    let message = 'The recruiter was updated'
    let status = 200

    try {
      if(coach !== null){
        //Now that we have the couch, we can search in its recruiters if the recruiter_id exists
        recruiter = await coach.recruiters().where('recruiter_id', id).first()
  
        if(recruiter !== null){
          //Lets update the recruiter info now that everything is in order
          recruiter.merge({ name })
          await recruiter.save()

        }else{
          message = 'The recruit could not be found'
          status = 404
        }

      }else{
        message = 'The coach could not be found'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when updating a recruiter',
        error
      }) 
    }

    return response.status(status).json({
      message,
      recruiter
    })
  }

  /**
   * Delete a recruiter with id.
   * DELETE recruiters/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ auth, params, request, response }) {
    const { id } = params
    const coach = await ( await auth.getUser() ).coach().first()

    let recruiter = {}

    //Lets start a transaction
    const trx = await Database.beginTransaction()
    try {
      if(coach === null){
        throw 'The coach could not be found, transaction rolledback'
      }      

      //Now that we have the couch, we can search in its recruiters if the recruiter_id exists
      recruiter = await coach.recruiters().where('recruiter_id', id).first()

      if(recruiter === null){
        throw 'The recruiter you tried to delete doesn\'t exists, transaction rolledback'
      }

      //If everything is in order, lets delete that recruiter
      await coach.recruiters().detach([recruiter.id], null, trx)
      await recruiter.delete(trx)

      //Commit the transaction
      await trx.commit()

    } catch (error) {
      //Cancel the transaction
      await trx.rollback()
      
      return response.status(500).json({
        message: 'Something went wrong when deleting a recruiter',
        error
      })
    }

    return response.status(200).json({
      message: 'The recruiter was deleted',
      recruiter
    })
  }

  /**
   * Share a recruiter from a coach to another.
   * POST recruiters-share
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async share ({ auth, request, response }) {
    const { recruiter_id, coach_id_to } = request.only(['recruiter_id', 'coach_id_to'])
    const coach = await ( await auth.getUser() ).coach().first()

    let recruiter = {}
    let message = 'The recruiter was shared'
    let status = 200

    try {
      const coach_to = await Coach.find(coach_id_to)
      if(coach_to !== null){
        //Now that we have the couch, we can search in its recruiters if the recruiter_id exists
        recruiter = await coach.recruiters().where('recruiter_id', recruiter_id).first()
  
        if(recruiter !== null){
          //Lets share the recruiter
          await coach_to.recruiters().attach(recruiter.id)

        }else{
          message = 'The recruit could not be found'
          status = 404
        }

      }else{
        message = 'The coach you wanted to share to could not be found'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when sharing a recruiter',
        error
      }) 
    }

    return response.status(status).json({
      message,
      recruiter
    })
  }
}

module.exports = RecruiterController
