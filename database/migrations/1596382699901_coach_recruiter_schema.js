'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CoachRecruiterSchema extends Schema {
  up () {
    this.create('coach_recruiter', (table) => {
      table.increments()
      table.integer('coach_id').unsigned().references('id').inTable('coaches')
      table.integer('recruiter_id').unsigned().references('id').inTable('recruiters')
      table.timestamps()
    })
  }

  down () {
    this.drop('coach_recruiter')
  }
}

module.exports = CoachRecruiterSchema
