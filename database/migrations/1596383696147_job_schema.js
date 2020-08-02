'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobSchema extends Schema {
  up () {
    this.create('jobs', (table) => {
      table.increments()
      table.string('title', 100)
      table.text('description')
      table.integer('recruiter_id').unsigned().references('id').inTable('recruiters') //For whom the job belongs to
      table.integer('candidate_id').unsigned().references('id').inTable('candidates') //Who made the Job
      table.timestamps()
    })
  }

  down () {
    this.drop('jobs')
  }
}

module.exports = JobSchema
