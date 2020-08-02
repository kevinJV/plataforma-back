'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Candidate extends Model {
    recruiter(){
        return this.belongsTo('App/Models/Recruiter')
    }

    job(){
        return this.hasMany('App/Model/Job')
    }

    log(){
        return this.hasMany('App/Model/Log')
    }

    note(){
        return this.hasMany('App/Model/Note')
    }
}

module.exports = Candidate
