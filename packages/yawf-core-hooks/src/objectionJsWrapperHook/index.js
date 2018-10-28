import Knex from 'knex'
import { Model } from 'objection'
import { Hook } from '@yawf/yawf-core'
import _ from 'lodash'

export default class extends Hook {

  knex /*: any */ = null

  defaults() {
    return {
      client: 'sqlite3',
      useNullAsDefault: true,
      connection: {
        filename: 'example.sqlite3'
      }
    }
  }

  async initialize() {
    this.knex = Knex($hookConfig(this))
    Model.knex(this.knex)
    const models = await $loadFiles('app', 'models')
    for (let key in models) {
      const regularModelName = _.upperFirst(key)
      const model = models[key]
      Object.defineProperty(model, 'tableName', {
        enumerable: true,
        configurable: true,
        get() {
          return key
        }
      })
      this.knex.schema.createTable(model.tableName)
      models[regularModelName] = model
      delete models[key]
    }
    $registerToGlobal(models)
    const globalFuncs = {}
    globalFuncs['$knex'] = (() => this.knex).bind(this)
    $registerToGlobal(globalFuncs)
  }

}
