// @flow
import { loadFiles } from '../util'

export default {
  $config,
  $hookConfig,
  $log,
  $error,
  $on,
  $events,
  $loadFiles
}

function $core() {
  return global['__frameworkCore']
}

function $config() {
  return $core().__config
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

function $emit(event /*: any */, ...args /*: any */) {
  $core().emit(event, ...args)
}

function $reloadGlobal() {
  $core().reloadGlobal()
}

function $on(event /*: any */, listenFn /*: any */) {
  $core().on(event, listenFn)
}

async function $loadFiles(...filesDir /*: Array<string> */) /*: { [string]: any }*/ {
  const objMap = await loadFiles($core().__rootDir, ...filesDir)
  return objMap
}
