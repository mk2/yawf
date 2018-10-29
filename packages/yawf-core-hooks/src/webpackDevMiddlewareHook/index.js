import webpack from 'webpack'
import middleware from 'webpack-dev-middleware'
import { Hook } from '@yawf/yawf-core'
import _ from 'lodash'

export default class extends Hook {

  defaults() {
    return {
    }
  }

  async initialize() {
    $addMiddleware(middleware(webpack({})))
  }

}
