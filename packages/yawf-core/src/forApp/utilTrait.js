import { readfiles, isClass } from '../util'

export default {

  get $logger() {
    return this.__logger
  },

  $success(...args) {
    this.$logger.success(...args)
  },

  $info(...args) {
    this.$logger.info(...args)
  },

  $debug(...args) {
    this.$logger.debug(...args)
  },

  $log(...args) {
    this.$logger.log(...args)
  },

  $error(...args) {
    this.$logger.error(...args)
  },

  $fatal(...args) {
    this.$logger.fatal(...args)
  },

  get $core() /*: InternalCoreApi */ {
    return this.__frameworkCore
  },

  get $config() {
    return this.$core.__config
  },

  get $hooks() /*: { [string]: any } */ {
    return this.$core.__hooks
  },

  get $hookConfig() {
    return this.$config.hook[this.__name]
  },

  get $events() {
    return this.$core.__events
  },

  get $middlewares() {
    return this.$core.__middlewares
  },

  $addMiddleware(middleware /*: Middleware */) {
    return this.$middlewares.push(middleware)
  },

  $loadHooks(hooks /*: any */) {
    return this.$core.loadHooks(hooks)
  },

  $emit(event /*: any */, ...args /*: any */) {
    return this.$core.emit(event, ...args)
  },

  $registerGlobal(obj /*: any */, ...prefixes /*: Array<string> */) {
    return this.$core.loadObjectToGlobal(obj, ...prefixes)
  },

  $reloadGlobal() {
    return this.$core.reloadGlobal()
  },

  $on(event /*: any */, listenFn /*: Function */) {
    return this.$core.on(event, listenFn)
  },

  async $readfiles(...args /*: any */) {
    return await readfiles(...args)
  },

  get $rootDir() {
    return this.$core.__rootDir
  },

  $deDef(mod /*: any */) {
    return mod.default ? mod.default : mod
  },

  async $import(path /*: string */) {
    return this.$deDef(await import(path))
  },

  get $isClass() {
    return isClass
  }
}
