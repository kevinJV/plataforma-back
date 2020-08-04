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
  Route.resource('directors', 'DirectorController').except(['store', 'update', 'destroy']).apiOnly().middleware(['auth', 'director']) 
  Route.resource('coaches', 'CoachController').apiOnly().middleware(['auth', 'director']) 
  Route.resource('recruiters', 'RecruiterController').apiOnly().middleware(['auth', 'coach']) 
  Route.resource('candidates', 'CandidateController').apiOnly().middleware(['auth', 'recruiter']) 
  Route.resource('candidates/:candidate_id/jobs', 'JobController').apiOnly().middleware(['auth', 'recruiter'])

  Route.post('permissions', 'PermissionController.store')
  Route.delete('permissions/:id', 'PermissionController.destroy')

  Route.post('register', 'UserController.register')
  Route.post('login', 'UserController.login')
  Route.get('roles', 'UserController.showRoles')
}).prefix('api/v1')

