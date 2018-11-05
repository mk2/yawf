export default {

  $success(...args) {
    this.__logger.success(...args)
  },

  $info(...args) {
    this.__logger.info(...args)
  },

  $debug(...args) {
    this.__logger.debug(...args)
  },

  $log(...args) {
    this.__logger.log(...args)
  },

  $error(...args) {
    this.__logger.error(...args)
  },

  $fatal(...args) {
    this.__logger.fatal(...args)
  },

  get $core() /*: InternalCoreApi */ {
    return this.__frameworkCore
  },

  get $config() {
    console.log(this)
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
    return this.$core.__middlewares.push(middleware)
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
    return envGlobal.$deDef(await import(path))
  },

  get $isClass() {
    return isClass
  }
}
