'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Permission extends Model {
    recruiters(){
        return this.belongsToMany('App/Models/Recruiter')
            .pivotTable('permissions')
    }
}

module.exports = Permission
