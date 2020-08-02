'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CoachSchema extends Schema {
  up () {
    this.create('coaches', (table) => {
      table.increments()
      table.string('name', 100)
      table.timestamps()
    })
  }

  down () {
    this.drop('coaches')
  }
}

module.exports = CoachSchema
