// @flow

import express from 'express'
import Core from './core'
import { dirname } from './util'

/*::
import type { ServerApi, InternalCoreApi } from './core'

type Options = {
  serverApi: ?ServerApi,
  port: number,
  rootDir: ?string
}

export interface StarterApi {
  +rootDir: ?string;
  +port: number;
  +core: ?InternalCoreApi;
  +events: any;
}
*/

export default class Starter /*:: implements StarterApi */ {

  __rootDir /*: ?string */ = null
  __port /*: number */ = 3000
  __serverApi /*: ?ServerApi */ = null
  __core /*: InternalCoreApi | void */ = undefined

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
    if (!this.core) return {}
    return this.core.__events
  }

  get logger() {
    if (!this.core) return console
    return this.core.__logger
  }

  async start() {
    if (!this.core) return
    const core = this.core
    try {
      core.emit(this.events.core.willBoot)
      core.emit(this.events.core.willSetup)
      await core.setup()
      core.emit(this.events.core.didSetup)
      core.play(this.port, () => {})
      core.emit(this.events.core.didBoot)
      core.emit(this.events.core.ready)
    } catch (e) {
      this.core.emit(this.events.core.didHappenError, e)
    }
  }

}

