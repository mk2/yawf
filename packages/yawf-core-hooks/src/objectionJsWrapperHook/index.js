import Knex from 'knex'
import { Model } from 'objection'
import { Hook } from '@yawf/yawf-core'

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
    console.log(models)
  }

}
