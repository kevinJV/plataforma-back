'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Director extends Model {
    coach(){
        return this.hasMany('App/Models/Coach')
    }
}

module.exports = Director
