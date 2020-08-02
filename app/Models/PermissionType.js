'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PermissionType extends Model {
    recruiter(){
        return this.belongsToMany('App/Model/Recruiter')
            .pivotTable('permissions')
    }
}

module.exports = PermissionType
