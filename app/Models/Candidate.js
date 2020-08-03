'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Candidate extends Model {
    recruiter(){
        return this.belongsTo('App/Models/Recruiter')
    }

    jobs(){
        return this.hasMany('App/Model/Job')
    }

    logs(){
        return this.hasMany('App/Model/Log')
    }

    notes(){
        return this.hasMany('App/Model/Note')
    }
}

module.exports = Candidate
