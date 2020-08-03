'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Recruiter extends Model {
    coaches(){
        return this.belongsToMany('App/Models/Coach')
            .pivotTable('coach_recruiter')
            .withTimestamps()
    }

    candidates(){
        return this.hasMany('App/Models/Candidate')
    }

    permissions(){
        return this.belongsToMany('App/Models/Permission')
            .pivotTable('permissions')
    }
}

module.exports = Recruiter
