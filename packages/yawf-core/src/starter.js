// @flow
import express from 'express'
import Core from './core'
import { dirname } from './util'

/*::
import type { ServerApi } from './core'

type Options = {
  serverApi: ?ServerApi,
  port: number,
  rootDir: ?string
}
*/

export default class {

  __rootDir /*: ?string */ = null
  __port /*: number */ = 3000
  __serverApi /*: ?ServerApi */ = null
  __core /*: any */ = null

  constructor(options /*: Options */) {
    options = options || {}
    this.__port = options.port || this.__port
    this.__serverApi = options.serverApi || express()
    this.__rootDir = options.rootDir || process.cwd()
    this.__core = new Core({
      serverApi: this.__serverApi,
      rootDir: this.__rootDir,
      options: {
        hateGlobal: false
      }
    })
  }
  
  get rootDir() {
    return this.__rootDir
  }

  get port() {
    return this.__port
  }

  get core() {
    return this.__core
  }

  get events() {
    return this.core.__events
  }

  get logger() {
    return this.core.__logger
  }

  async start() {
    try {
      this.core.emit(this.events.core.willBoot)
      this.core.emit(this.events.core.willSetup)
      await this.core.setup()
      this.core.emit(this.events.core.didSetup)
      this.core.play(this.port, () => {})
      this.core.emit(this.events.core.didBoot)
      this.core.emit(this.events.core.ready)
    } catch (e) {
      this.core.emit(this.events.core.didHappenError, e)
    }
  }

}

