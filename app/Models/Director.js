'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Director extends Model {
    coaches(){
        return this.hasMany('App/Models/Coach')
    }

    user(){
        return this.belongsTo('App/Models/User')
    }
}

module.exports = Director
