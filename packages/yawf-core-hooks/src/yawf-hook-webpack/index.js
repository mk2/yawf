import webpack from 'webpack'
import middleware from 'webpack-dev-middleware'
import { Hook } from '@yawf/yawf-core'
import _ from 'lodash'
import path from 'path'
import _fs from 'fs'
const fs = _fs.promises

export default class extends Hook {

  defaults() {
    return {
      webpackConfigFile: 'webpack.config.js',
      webpackConfig: {
        output: {
          filename: 'main.js',
          path: path.resolve(this.$config.app.clientDir, 'dist')
        }
      }
    }
  }

  async initialize() {
    const clientDir = this.$config.app.clientDir
    if (!(await this.__hasWebpackConfigJsFile({ clientDir }))) {
      this.$debug(`This project has not ${this.$hookConfig.webpackConfigFile} in ${clientDir} directory.`)
      return
    }

    const webpackUserConfig = await this.$import(path.resolve(this.$rootDir, clientDir, this.$hookConfig.webpackConfigFile))
    const webpackConfig = _.merge(
      {
        mode: this.$config.app.isProduction ? 'production' : 'development',
        context: path.resolve(this.$rootDir, clientDir),
        resolve: {
          modules: [path.resolve(this.$rootDir, clientDir, 'node_modules')]
        }
      },
      this.$hookConfig.webpackConfig,
      webpackUserConfig()
    )

    if (this.$config.app.isProduction) {
      this.$debug(`Production mode, so compile assets.`)
      this.__processWebpack({ clientDir, webpackConfig })
    } else {
      this.$debug(`Not produciton mode, so invoke webpackDevMiddleware.`)
      this.__processWebpackDevMiddleware({ clientDir, webpackConfig })
    }
  }

  async __hasWebpackConfigJsFile({ clientDir }) {
    const webpackConfigJsFile = path.resolve(this.$rootDir, clientDir, this.$hookConfig.webpackConfigFile)

    try {
      await fs.access(webpackConfigJsFile)
      return true
    } catch (e) {
      return false
    }
  }

  async __processWebpack({ clientDir, webpackConfig }) {
    const compiler = webpack(webpackConfig)
    this.$addStatic(path.resolve(webpackConfig.output.path))
    return await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) reject(err)
        this.$debug('Webpack compilation was succeeded!')
      })
    })
  }

  async __processWebpackDevMiddleware({ clientDir, webpackConfig }) {
    this.$addMiddleware(middleware(webpack(webpackConfig), {
      logger: this.__logger.scope('webpack')
    }))
  }

}
