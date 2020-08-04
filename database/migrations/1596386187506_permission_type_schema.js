'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database');

class PermissionTypeSchema extends Schema {
  up () {
    this.create('permission_types', (table) => {
      table.increments()
      table.string('table_name')
    })

    // Set up default tables
    this.schedule(async (trx) => {
      await Database.table('permission_types').transacting(trx).insert([
        {table_name: 'Jobs'},
        {table_name: 'Logs'},
        {table_name: 'Notes'}
      ])
    })
  }

  down () {
    this.drop('permission_types')
  }
}

module.exports = PermissionTypeSchema
