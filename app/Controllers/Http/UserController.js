'use strict'

const User = use('App/Models/User')
const Role = use('App/Models/Role')
const Director = use('App/Models/Director')
const Database = use('Database');

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
    // const { username, email, password, role_id } = request.only(['username', 'email', 'password', 'role_id'])
    const { username, email, password } = request.only(['username', 'email', 'password'])
    const role_id = 1

    let user = {};
    let message = 'The register was succesfully'
    let status = 200
    let roleData = {}

    //We are gonna need a transaction
    const trx = await Database.beginTransaction()
    try {
        //Check if the role exists
        const role = await Role.find(role_id)

        // if(role !== null){
        if(role !== null && role.name == "Director"){
            //Lets create the user
            user = await User.create({
                username,
                email,
                password,
                role_id
            }, trx)

            //Lets check which role account will be created
            switch (role.name) {
                case "Director":
                    roleData = await Director.create({
                        name: username,
                        user_id: user.id
                    }, trx)
                    break;
                /**
                 * I didnt implemented these since they need extra info that it is just not avalaible in the conventional way
                 * So I opted to only allow directors to be registered easily, is a coach o recruiter needs to be created
                 * First a directors neeed to exists, then that director should create a coach and at the same time
                 * that method will create a user
                 */
                // case "Coach":
                //     console.log("Creare un coach")
                //     break;
                // case "Recruiter":
                //     console.log("Creare un recruiter")
                //     break;
                default:
                    throw "The role has yet to be implemented"
            }

            //Add the roleData createed
            // user.role = roleData
            user.director = roleData

        }else{
            message = 'The role could not be found'
            status = 404
        }

        await trx.commit()

    }
    catch (error) {
        await trx.rollback()

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
