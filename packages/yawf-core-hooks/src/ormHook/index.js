import path from 'path'
import Sequelize from 'sequelize'
import { Hook } from '@yawf/yawf-core'
import _ from 'lodash'

export default class extends Hook {

  sequelize /*: any */ = null

  defaults() {
    return {
      databaseName: 'yawf-demo',
      user: '',
      password: '',
      options: {
        host: '',
        dialect: 'sqlite',
        storage: null,
        operatorsAliases: false
      }
    }
  }

  async initialize() {
    const hookConfig = $hookConfig(this)
    const defaultStorage = path.resolve($rootDir, $hookConfig(this).databaseName + '.db')
    const dbName = hookConfig.databaseName
    const dbUser = hookConfig.user
    const dbUserPassword = hookConfig.password
    const options = hookConfig.options
    options.storage = options.storage || defaultStorage
    options.logging = this.__logger.scope('sequelize').debug
    this.sequelize = new Sequelize(dbName, dbUser, dbUserPassword, options)
    $registerGlobal({
      DataTypes: Sequelize.DataTypes,
      Op: Sequelize.Op
    })
    const models = await $readfiles($rootDir, [ 'server', 'models' ])
    for (let key in models) {
      const regularModelName = _.upperFirst(_.camelCase(key))
      const userModel = models[key]
      const model = this.sequelize.define(regularModelName, userModel.definition())
      model.sync()
      models[regularModelName] = () => model
      delete models[key]
    }
    $registerGlobal(models)
    const globalFuncs = {}
    globalFuncs['$db'] = (() => this.sequelize).bind(this)
    globalFuncs['$transaction'] = () => ((...args) => this.sequelize.transaction(...args)).bind(this)
    globalFuncs['$query'] = () => ((...args) => this.sequelize.query(...args)).bind(this)
    $registerGlobal(globalFuncs)
  }

}
