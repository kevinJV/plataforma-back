'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Log extends Model {
    candidate(){
        return this.belongsTo('App/Model/Candidate')
    }
}

module.exports = Log
