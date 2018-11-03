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
    const clientFileDir = $config.app.clientDir
    const webpackUserConfig = await $import(path.resolve($rootDir, clientFileDir, $hookConfig(this).webpackConfigFile))
    $addMiddleware(middleware(webpack({
      ...webpackUserConfig(),
      context: path.resolve($rootDir, clientFileDir),
      resolve: {
        modules: [path.resolve($rootDir, clientFileDir, 'node_modules')]
      }
    }), {
    }))
  }

}
