'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NoteSchema extends Schema {
  up () {
    this.create('notes', (table) => {
      table.increments()
      table.string('title', 100)
      table.text('description')
      table.integer('recruiter_id').unsigned().references('id').inTable('recruiters') //For whom the note belongs to
      table.integer('candidate_id').unsigned().references('id').inTable('candidates') //Who made the note
      table.timestamps()
    })
  }

  down () {
    this.drop('notes')
  }
}

module.exports = NoteSchema
