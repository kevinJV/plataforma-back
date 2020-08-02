'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PermissionTypeSchema extends Schema {
  up () {
    this.create('permission_types', (table) => {
      table.increments()
      table.string('table_name')
      table.timestamps()
    })
  }

  down () {
    this.drop('permission_types')
  }
}

module.exports = PermissionTypeSchema
