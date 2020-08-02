'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LogSchema extends Schema {
  up () {
    this.create('logs', (table) => {
      table.increments()
      table.string('title', 100)
      table.text('description')
      table.integer('recruiter_id').unsigned().references('id').inTable('recruiters') //For whom the log belongs to
      table.integer('candidate_id').unsigned().references('id').inTable('candidates') //Who made the log
      table.timestamps()
    })
  }

  down () {
    this.drop('logs')
  }
}

module.exports = LogSchema
