// @flow

import path from 'path'
import Sequelize from 'sequelize'
import { Hook } from '@yawf/yawf-core'
import _ from 'lodash'

/*::
import { Model } from 'sequelize'
 */

export default class extends Hook {

  sequelize /*: ?Sequelize */ = null

  models /*: { [string]: Model<any, any, any> } */ = {}

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
      },
      defaultDefineOptions: {
        freezeTableName: true
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
    const sequelize = new Sequelize(dbName, dbUser, dbUserPassword, options)
    const models = await this.$readmodules(this.$rootDir, [ 'server', 'models' ])
    for (let key in models) {
      const regularModelName = _.upperFirst(_.camelCase(key))
      const userModel = models[key]
      const modelDefinition = new userModel()

      if (this.__validateModelDefinition(modelDefinition)) {
        this.$debug(`${regularModelName} has valid model definition.`)
      } else {
        this.$error(new Error(`${regularModelName} has invalid model definition.`))
        continue
      }

      const columns       = modelDefinition.columns({ DataTypes: Sequelize, Op: Sequelize.Op })
      const options       = _.defaultTo(modelDefinition.options ? modelDefinition.options() : null, _.cloneDeep(hookConfig.defaultDefineOptions))
      const getterMethods = _.defaultTo(modelDefinition.getterMethods ? modelDefinition.getterMethods() : null, {})
      const setterMethods = _.defaultTo(modelDefinition.setterMethods ? modelDefinition.setterMethods() : null, {})
      _.merge(options, { getterMethods, setterMethods })

      const model = sequelize.define(regularModelName, columns, options)
      model.sync()
      delete models[key]
      models[regularModelName] = model
    }
    this.models = models
    this.sequelize = sequelize
  }

  __validateModelDefinition(modelDefinition /*: any */) {
    return !!modelDefinition.columns
  }

  registerMixins() {
    const sequelize = this.sequelize
    const models = this.models
    return {
      utilMixin(Base /*: Class<any> */) /*: Class<any> */ {
        return class extends Base {

          get $models() /*: { [string]: Model<any, any, any> } */ {
            return models
          }

          get $db() /*: ?Sequelize */ {
            return sequelize
          }

          $transaction(...args /*: any */) {
            if (sequelize) sequelize.transaction(...args)
          }

          $query(...args /*: any */) {
            if (sequelize) sequelize.query(...args)
          }

        }
      }
    }
  }

  async teardown() {
    const sequelize = this.sequelize
    if (sequelize) await sequelize.close()
  }

}
