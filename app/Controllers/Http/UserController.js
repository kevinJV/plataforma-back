'use strict'

const User = use('App/Models/User')
const Role = use('App/Models/Role')

class UserController {
   /**
    * A basic login using email and password
    * 
    * POST login
    */
   async login({auth, request}){
    const {email, password} = request.only(['email', 'password'])

    return await auth.attempt(email, password)
   }

   /**
    * A basic register that takes into account role
    * 
    * POST register
    */
   async register({ request, response }){
    const { username, email, password, role_id } = request.only(['username', 'email', 'password', 'role_id'])

    let user = {};
    let message = 'The register was succesfully'
    let status = 200

    try {
        //Check if the role exists
        const role = await Role.find(role_id)
        if(role !== null){
            user = await User.create({
                username,
                email,
                password,
                role_id
            })
        }else{
            message = 'The role could not be found'
            status = 404
        }

    }
    catch (error) {
        return response.status(500).json({
            message: 'Something went wrong when register a new user',
            error
        })
    }
    
    return response.status(status).json({
        message,
        user
      })
   }

   /**
    * Show all availables roles
    * 
    * GET roles
    */

    async showRoles({request, response}){
        try {
            return response.type(200).json(await Role.all())
            
          } catch (error) {
            return response.status(500).json({
              message: 'Something went wrong when getting all the roles',
              error
            })  
          }
    }
}

module.exports = UserController
