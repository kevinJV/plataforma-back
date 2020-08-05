'use strict'
const Recruiter = use('App/Models/Recruiter')
const Candidate = use('App/Models/Candidate')
const Note = use('App/Models/Note')
const Permission = use('App/Models/Permission')
const PermissionType = use('App/Models/PermissionType')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with notes
 */
class NoteController {

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
   * Show a list of all notes.
   * GET candidates/:candidate_id/notes
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ auth, params, request, response, view }) {
    const { candidate_id } = params
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Notes')).id

    try {
      let notes = []

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
          notes = await candidate.notes().fetch()
        }

      }

      return response.type(200).json(notes)

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when getting all the notes',
        error
      })
    }
  }

  /**
   * Create/save a new note.
   * POST candidates/:candidate_id/notes
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, params, request, response }) {
    const { candidate_id } = params
    const { title, description } = request.only(['title', 'description'])
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Notes')).id //Find the permission id

    let note = {}
    let message = 'The note was created successfully'
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
          //Now we can create the note
          note = await Note.create({
            title,
            description,
            candidate_id,
            recruiter_id: recruiter.id
          })

        }else{
          message = 'The candidate was not found, could not create a note'
          status = 404
        }        

      }else{
        message = 'The recruiter was not found, could not create a note'
        status = 404
      }
      
    } catch (error) {
      return response.status(500).json({
        message: 'The note could not be created',
        error
      })      
    }

    return response.status(status).json({
      message,
      note
    })
  }

  /**
   * Display a single note.
   * GET candidates/:candidate_id/notes/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ auth, params, request, response, view }) {
    const { candidate_id, id } = params
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Notes')).id //Find the permission id

    let note = {}
    let message = 'The note was found successfully'
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
        //Now that we have the candidate, lets search that note
        note = await candidate.notes().where('id', id).first()

        if(note === null){
          message = 'The note was not found'
          status = 404
        }

      }else{
        message = 'The candidate was not found, could not show the note'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when searching a note',
        error
      })  
    }
  
    return response.status(status).json({
      message,
      note
    })
  }

  /**
   * Update note details.
   * PUT or PATCH candidates/:candidate_id/notes/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ auth, params, request, response }) {
    const { candidate_id, id } = params
    const { title, description } = request.only(['title', 'description'])
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Notes')).id //Find the permission id

    let note = {}
    let message = 'The note was updated'
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
        //Now that we have the candidate, lets search that note
        note = await candidate.notes().where('id', id).first()

        if(note !== null){
          //Lets save the changes
          note.merge({ title, description })
          await note.save()

        }else{
          message = 'The note you tried to edit doesn\'t exist'
          status = 404
        }
        
      }else{
        message = 'The candidate was not found, could not update the note'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when updating a note',
        error
      }) 
    }

    return response.status(status).json({
      message,
      note
    })
  }

  /**
   * Delete a note with id.
   * DELETE notes/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ auth, params, request, response }) {
    const { candidate_id, id } = params
    const recruiter = await this.getRecruiter(request, params, auth)
    const permission_type_id = (await PermissionType.findBy('table_name', 'Notes')).id //Find the permission id

    let note = {}
    let message = 'The note was deleted'
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
        //Now that we have the candidate, lets search that note
        note = await candidate.notes().where('id', id).first()

        if(note !== null){
          //If that note exists, then delete it now
          await note.delete()

        }else{
          message = 'The note you tried to delete doesn\'t exists'
          status = 404
        }
        
      }else{
        message = 'The candidate was not found, could not delete the note'
        status = 404
      }

    } catch (error) {
      return response.status(500).json({
        message: 'Something went wrong when deleting a note',
        error
      }) 
    }

    return response.status(status).json({
      message,
      note
    })
  }
}

module.exports = NoteController
