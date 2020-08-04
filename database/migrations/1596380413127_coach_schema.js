'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CoachSchema extends Schema {
  up () {
    this.create('coaches', (table) => {
      table.increments()
      table.string('name', 100)
      table.integer('user_id').unsigned().references('id').inTable('users') //Which user he belongs to
      table.integer('director_id').unsigned().references('id').inTable('directors')
      table.timestamps()
    })
  }

  down () {
    this.drop('coaches')
  }
}

module.exports = CoachSchema
