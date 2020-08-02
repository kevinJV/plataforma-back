'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Recruiter extends Model {
    coach(){
        return this.belongsToMany('App/Models/Coach')
            .pivotTable('coach_recruiter')
    }

    candidate(){
        return this.hasMany('App/Models/Candidate')
    }
}

module.exports = Recruiter
