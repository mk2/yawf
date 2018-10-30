// @flow

/*::
import type { Middleware } from 'express'
import type { InternalCoreApi } from '../core'
 */

import { loadFiles } from '../util'

export default {
  $config,
  $hookConfig,
  $log,
  $error,
  $on,
  $events,
  $loadFiles,
  $registerGlobal,
  $hooks,
  $loadHooks,
  $middlewares,
  $addMiddleware,
  $rootDir,
  $deDef
}

function $core() /*: InternalCoreApi */ {
  return global['__frameworkCore']
}

function $config() {
  return $core().__config
}

function $hooks() /*: { [string]: any } */ {
  return $core().__hooks
}

function $hookConfig(hook /*: any */) {
  return $config().hook[hook.__name]
}

function $log(...args /*: any */) {
  $core().__logger.log(...args)
}

function $error(...args /*: any */) {
  $core().__logger.error(...args)
}

function $events() {
  return $core().__events
}

function $middlewares() /*: Array<Middleware> */ {
  return $core().__middlewares
}

function $addMiddleware(middleware /*: Middleware */) {
  $core().__middlewares.push(middleware)
}

function $loadHooks(hooks /*: any */) {
  $core().loadHooks(hooks)
}

function $emit(event /*: any */, ...args /*: any */) {
  $core().emit(event, ...args)
}

function $registerGlobal(obj /*: any */, ...prefixes /*: Array<string> */) {
  $core().loadObjectToGlobal(obj, ...prefixes)
}

function $reloadGlobal() {
  $core().reloadGlobal()
}

function $on(event /*: any */, listenFn /*: Function */) {
  $core().on(event, listenFn)
}

async function $loadFiles(...filesDir /*: Array<string> */) /*: Promise<{ [string]: any }> */ {
  const objMap = await loadFiles($core().__rootDir, ...filesDir)
  return objMap
}

function $rootDir() {
  return $core().__rootDir
}

function $deDef(mod /*: any */) {
  return mod.default ? mod.default : mod
}

