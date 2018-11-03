// @flow

/*::
import type { Middleware } from 'express'
import type { InternalCoreApi } from '../core'
 */

import { readfiles, isClass } from '../util'

export default {
  $core,
  $config,
  $hookConfig,
  $log,
  $error,
  $on,
  $events,
  $readfiles,
  $registerGlobal,
  $hooks,
  $loadHooks,
  $middlewares,
  $addMiddleware,
  $rootDir,
  $deDef,
  $import
}

function $core(envGlobal /*: any */) /*: InternalCoreApi */ {
  return envGlobal['__frameworkCore']
}

function $config(envGlobal /*: any */) {
  return envGlobal.$core.__config
}

function $hooks(envGlobal /*: any */) /*: { [string]: any } */ {
  return envGlobal.$core.__hooks
}

function $hookConfig(envGlobal /*: any */) {
  return (hook /*: any */) => envGlobal.$config.hook[hook.__name]
}

function $log(envGlobal /*: any */) {
  return (...args /*: any */) => {
    return envGlobal.$core.__logger.log(...args)
  }
}

function $error(envGlobal /*: any */) {
  return (...args /*: any */) => {
    return envGlobal.$core.__logger.error(...args)
  }
}

function $events(envGlobal /*: any */) {
  return () => envGlobal.$core.__events
}

function $middlewares(envGlobal /*: any */) {
  return () => envGlobal.$core.__middlewares
}

function $addMiddleware(envGlobal /*: any */) {
  return (middleware /*: Middleware */) => envGlobal.$core.__middlewares.push(middleware)
}

function $loadHooks(envGlobal /*: any */) {
  return (hooks /*: any */) => envGlobal.$core.loadHooks(hooks)
}

function $emit(envGlobal /*: any */) {
  return (event /*: any */, ...args /*: any */) => envGlobal.$core.emit(event, ...args)
}

function $registerGlobal(envGlobal /*: any */) {
  return (obj /*: any */, ...prefixes /*: Array<string> */) => envGlobal.$core.loadObjectToGlobal(obj, ...prefixes)
}

function $reloadGlobal(envGlobal /*: any */) {
  return () => envGlobal.$core.reloadGlobal()
}

function $on(envGlobal /*: any */) {
  return (event /*: any */, listenFn /*: Function */) => envGlobal.$core.on(event, listenFn)
}

function $readfiles(envGlobal /*: any */) {
  return async (...args /*: any */) => {
    return await readfiles(...args)
  }
}

function $rootDir(envGlobal /*: any */) {
  return envGlobal.$core.__rootDir
}

function $deDef(envGlobal /*: any */) {
  return (mod /*: any */) => {
    return mod.default ? mod.default : mod
  }
}

function $import(envGlobal /*: any */) {
  return async (path /*: string */) => {
    return envGlobal.$deDef(await import(path))
  }
}

function $isClass(envGlobal /*: any */) {
  return isClass
}

