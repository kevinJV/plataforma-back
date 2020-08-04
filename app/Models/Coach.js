'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Coach extends Model {
    director(){
        return this.belongsTo('App/Models/Director')
    }

    recruiters(){
        return this.belongsToMany('App/Models/Recruiter')
            .pivotTable('coach_recruiter')
            .withTimestamps()
    }

    user(){
        return this.belongsTo('App/Models/User')
    }
}

module.exports = Coach
