import path from 'path'
import Sequelize from 'sequelize'
import { Hook } from '@yawf/yawf-core'
import _ from 'lodash'

export default class extends Hook {

  sequelize /*: any */ = null

  models /*: any */ = {}

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
    const hookConfig = this.$hookConfig
    const dbName = hookConfig.databaseName
    const dbUser = hookConfig.user
    const dbUserPassword = hookConfig.password
    const options = hookConfig.options
    const defaultStorage = path.resolve(this.$rootDir, dbName + '.db')
    options.storage = options.storage || defaultStorage
    options.logging = this.$logger.scope('sequelize').debug
    this.sequelize = new Sequelize(dbName, dbUser, dbUserPassword, options)
    const models = await this.$readfiles(this.$rootDir, [ 'server', 'models' ])
    for (let key in models) {
      const regularModelName = _.upperFirst(_.camelCase(key))
      const userModel = models[key]
      const model = this.sequelize.define(regularModelName, userModel.definition({ DataTypes: Sequelize.DataTypes, Op: Sequelize.Op }))
      model.sync()
      models[regularModelName] = () => model
      delete models[key]
    }
    this.models = models
  }

  registerMixins() {
    const sequelize = this.sequelize
    const models = this.models
    return {
      utilMixin(Base /*: Class<any> */) /*: Class<any> */ {
        return class extends Base {

          get $models() {
            return models
          }

          get $db() {
            return sequelize
          }

          $transaction(...args /*: any */) {
            return sequelize.transaction(...args)
          }

          $query(...args /*: any */) {
            return sequelize.query(...args)
          }

        }
      }
    }
  }

}
