import { Hook } from '@yawf/yawf-core'
import _ from 'lodash'

export default class extends Hook {

  knex /*: any */ = null

  defaults() {
    return {
      sqlite: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
          filename: 'yawf.sqlite3'
        }
      },
      globalPrefix: 'objection'
    }
  }

  async initialize() {
    const prefix = $hookConfig(this).globalPrefix
    this.knex = Knex($hookConfig(this).sqlite)
    Model.knex(this.knex)
    $registerGlobal({ Model })
    const models = await $loadDirFiles('server', 'models')
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
    $registerGlobal(models)
    const globalFuncs = {}
    globalFuncs['$knex'] = (() => this.knex).bind(this)
    $registerGlobal(globalFuncs)
  }

}
