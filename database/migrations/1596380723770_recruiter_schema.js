'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RecruiterSchema extends Schema {
  up () {
    this.create('recruiters', (table) => {
      table.increments()
      table.string('name', 100)
      table.integer('user_id').unsigned().references('id').inTable('users') //Which user he belongs to
      table.timestamps()
    })
  }

  down () {
    this.drop('recruiters')
  }
}

module.exports = RecruiterSchema
