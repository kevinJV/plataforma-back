'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database');

class RoleSchema extends Schema {
  up () {
    this.create('roles', (table) => {
      table.increments()
      table.string('name', 50)
    })

    // Set up default roles
    this.schedule(async (trx) => {
      await Database.table('roles').transacting(trx).insert([
        {name: 'Director'},
        {name: 'Coach'},
        {name: 'Recruiter'}
      ])
    })
  }

  down () {
    this.drop('roles')
  }
}

module.exports = RoleSchema
