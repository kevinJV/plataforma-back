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

    permissionTypes(){
        return this.hasMany('App/Models/PermissionType')
            .pivotTable('permissions')
    }
}

module.exports = Recruiter
