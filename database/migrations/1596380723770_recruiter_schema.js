'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RecruiterSchema extends Schema {
  up () {
    this.create('recruiters', (table) => {
      table.increments()
      table.string('name', 100)
      table.timestamps()
    })
  }

  down () {
    this.drop('recruiters')
  }
}

module.exports = RecruiterSchema
