'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PermissionSchema extends Schema {
  up () {
    this.create('permissions', (table) => {
      table.increments()
      table.integer('recruiter_id').unsigned().references('id').inTable('recruiters') //I aim to make a relationship of many to many between recruiter and permission_type
      table.integer('permission_type_id').unsigned().references('id').inTable('permission_types') //^
      table.integer('coach_id').unsigned().references('id').inTable('coaches') //but we need to know which coach created the permission
      table.integer('candidate_id').unsigned().references('id').inTable('candidates') //and to whom the permission affects
      table.timestamps()
    })
  }

  down () {
    this.drop('permissions')
  }
}

module.exports = PermissionSchema
