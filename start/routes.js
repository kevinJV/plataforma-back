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
  /**
   * Director routes
   */   
  Route.resource('directors', 'DirectorController').except(['store', 'update', 'destroy'])
    .apiOnly().middleware(['auth', 'director'])

  Route.get('directors-hierarchy', 'DirectorController.indexHierarchy')
    .middleware(['auth', 'director'])

  /**
   * Coach routes
   */
  Route.resource('coaches', 'CoachController')
    .apiOnly().middleware(['auth', 'director'])
    .validator(new Map([
      [['coaches.store'], ['StoreCoach']],
      [['coaches.update'], ['UpdateCoach']]
    ]))

  Route.get('coach-hierarchy', 'CoachController.indexHierarchy')
    .middleware(['auth', 'coach'])


  /**
   * Recruiter routes
   */
  Route.resource('recruiters', 'RecruiterController')
    .apiOnly().middleware(['auth', 'coach'])
    .validator(new Map([
      [['recruiters.store'], ['StoreRecruiter']],
      [['recruiters.update'], ['UpdateRecruiter']]
    ]))

  Route.post('recruiters-share', 'RecruiterController.share')
    .middleware(['auth', 'coach'])
    .validator(['ShareRecruiter'])

  /**
   * Candidate routes
   */
  Route.resource('candidates', 'CandidateController')
    .apiOnly().middleware(['auth', 'recruiter'])
    .validator(new Map([
      [['candidates.store'], ['StoreCandidate']],
      [['candidates.update'], ['UpdateCandidate']]
    ])) 

  /**
   * Job routes
   */
  Route.resource('candidates/:candidate_id/jobs', 'JobController')
    .apiOnly().middleware(['auth', 'recruiter_variant'])
    .validator(new Map([
      [['candidates/:candidate_id/jobs.store'], ['StoreJob']],
      [['candidates/:candidate_id/jobs.update'], ['UpdateJob']]
    ]))

  /**
   * Log routes
   */
  Route.resource('candidates/:candidate_id/logs', 'LogController')
    .apiOnly().middleware(['auth', 'recruiter_variant'])
    .validator(new Map([
      [['candidates/:candidate_id/logs.store'], ['StoreLog']],
      [['candidates/:candidate_id/logs.update'], ['UpdateLog']]
    ]))
  
  /**
   * Note routes
   */
  Route.resource('candidates/:candidate_id/notes', 'NoteController')
    .apiOnly().middleware(['auth', 'recruiter_variant'])
    .validator(new Map([
      [['candidates/:candidate_id/notes.store'], ['StoreNote']],
      [['candidates/:candidate_id/notes.update'], ['UpdateNote']]
    ]))

  /**
   * Permission routes
   */
  Route.post('permissions', 'PermissionController.store')
    .middleware(['auth', 'coach'])
    .validator('StorePermission')

  Route.delete('permissions/:id', 'PermissionController.destroy')
    .middleware(['auth', 'coach']) 

  /**
   * User routes
   */
  Route.post('register', 'UserController.register')
    .validator('RegisterUser')

  Route.post('login', 'UserController.login')
    .validator('LoginUser')

  Route.get('roles', 'UserController.showRoles')

}).prefix('api/v1')

