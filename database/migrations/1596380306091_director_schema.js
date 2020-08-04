'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DirectorSchema extends Schema {
  up () {
    this.create('directors', (table) => {
      table.increments()
      table.string('name', 100)
      table.integer('user_id').unsigned().references('id').inTable('users') //Which user he belongs to
      table.timestamps()
    })
  }

  down () {
    this.drop('directors')
  }
}

module.exports = DirectorSchema
