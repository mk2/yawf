// @flow

/*::
import InternalCoreApi from '../core'
import type { Middleware } from 'express'
import type { InternalHookApi } from './hook'
 */

import { readfiles, isClass, mergeWithProp } from '../util'

export default function(Base /*: Class<any> */) /*: Class<any> */ {
  return class extends Base {

    get $logger() {
      return this.__logger
    }

    $success(...args /*: any */) {
      this.$logger.success(...args)
    }

    $info(...args /*: any */) {
      this.$logger.info(...args)
    }

    $debug(...args /*: any */) {
      this.$logger.debug(...args)
    }

    $log(...args /*: any */) {
      this.$logger.log(...args)
    }

    $error(...args /*: any */) {
      this.$logger.error(...args)
    }

    $fatal(...args /*: any */) {
      this.$logger.fatal(...args)
    }

    get $core() /*: InternalCoreApi */ {
      return this.__frameworkCore
    }

    get $config() /*: any */ {
      return this.$core.__config
    }

    get $hooks() /*: { [string]: InternalHookApi } */ {
      return this.$core.__hooks
    }

    get $hookConfig() /*: any */ {
      return this.$config.hook[this.__name]
    }

    get $events() {
      return this.$core.__events
    }

    get $middlewares() {
      return this.$core.__middlewares
    }

    $addMiddleware(middleware /*: Middleware */) {
      return this.$middlewares.push(middleware)
    }

    $loadHooks(hooks /*: any */) {
      return this.$core.loadHooks(hooks)
    }

    $emit(event /*: any */, ...args /*: any */) {
      return this.$core.emit(event, ...args)
    }

    $on(event /*: any */, listenFn /*: Function */) {
      return this.$core.on(event, listenFn)
    }

    async $readfiles(...args /*: any */) {
      return await readfiles(...args)
    }

    get $rootDir() {
      return this.$core.__rootDir
    }

    $deDef(mod /*: any */) {
      return mod.default ? mod.default : mod
    }

    async $import(path /*: string */) {
      return this.$deDef(await import(path))
    }

    get $isClass() {
      return isClass
    }

  }
}
