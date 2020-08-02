'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Coach extends Model {
    director(){
        return this.belongsTo('App/Models/Director')
    }
}

module.exports = Coach
