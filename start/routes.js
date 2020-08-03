'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

Route.group(() => { 
  Route.resource('directors', 'DirectorController').apiOnly() 
  Route.resource('coaches', 'CoachController').apiOnly() 
  Route.resource('recruiters', 'RecruiterController').apiOnly() 
  Route.resource('candidates', 'CandidateController').apiOnly() 
  Route.resource('jobs', 'JobController').apiOnly() 

  Route.post('permissions', 'PermissionController.store')
  Route.delete('permissions/:id', 'PermissionController.destroy')
}).prefix('api/v1')

