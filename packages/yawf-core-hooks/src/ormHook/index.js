import Sequelize from 'sequelize'
import { Hook } from '@yawf/yawf-core'
import _ from 'lodash'

export default class extends Hook {

  sequelize /*: any */ = null

  defaults() {
    return {
    }
  }

  async initialize() {
    this.sequelize = new Sequelize({ dialect: 'sqlite', storage: 'sample.sqlite3' })
    $registerGlobal({
      ColumnTypes: Sequelize.DataTypes
    })
    const models = await $loadDirFiles('server', 'models')
    for (let key in models) {
      const regularModelName = _.upperFirst(_.camelCase(key))
      const model = models[key]
      models[regularModelName] = this.sequelize.define(regularModelName, model.schema())
      delete models[key]
    }
    $registerGlobal(models)
    const globalFuncs = {}
    globalFuncs['$db'] = (() => this.sequelize).bind(this)
    $registerGlobal(globalFuncs)
  }

}
