import webpack from 'webpack'
import middleware from 'webpack-dev-middleware'
import { Hook } from '@yawf/yawf-core'
import _ from 'lodash'
import path from 'path'

export default class extends Hook {

  defaults() {
    return {
      webpackConfigFile: 'webpack.config.js'
    }
  }

  async initialize() {
    const clientFileDir = this.$config.app.clientDir
    const webpackUserConfig = await this.$import(path.resolve(this.$rootDir, clientFileDir, this.$hookConfig.webpackConfigFile))
    this.$addMiddleware(middleware(webpack({
      ...webpackUserConfig(),
      context: path.resolve(this.$rootDir, clientFileDir),
      resolve: {
        modules: [path.resolve(this.$rootDir, clientFileDir, 'node_modules')]
      }
    }), {
      logger: this.__logger.scope('webpack')
    }))
  }

}
