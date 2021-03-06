// @flow

import path from 'path'
import EventEmitter from 'events'
import FrameworkEvents from './framework-events'
import _ from 'lodash'
import { readmodules, isClass, mapKeysDeep, globfiles } from './util'
import defaultConfig from './config'
import signale, { Signale } from 'signale'
import utilMixin from './forApp/utilMixin'
import bodyParser from 'body-parser'
import { Worker } from 'worker_threads'

/*::
import type { $Application, $Request, $Response, NextFunction, Middleware } from 'express'
import express from 'express'
import { InternalHookApi } from './forApp/hook'

export type Path = string | RegExp
export type ServerApi = $Application
export type Req = $Request
export type Res = $Response
export type NextFn = NextFunction
export type Mixin = (Class<any>) => Class<any>

type CoreStartOptions = {
}

type ConstructorArguments = {
  serverApi: ?ServerApi,
  rootDir: ?string,
  options: CoreStartOptions
}

type ActionFn = (req: Req, res: Res) => void

type RouteFunctionArguments = {
  path: Path,
  actionFn: ActionFn
}

export interface CoreApi {
  get(RouteFunctionArguments): void;
  post(RouteFunctionArguments): void;
  put(RouteFunctionArguments): void;
  delete(RouteFunctionArguments): void;
  play(number, Function): void;
  reloadGlobal(): void;
  bootstrap(): void;
  initialize(): ?Promise<any>;
  loadHooks({ [string]: InternalHookApi }): void;
  on(any, Function): CoreApi;
  emit(any, ...args: Array<any>): boolean;
  loadObjectToGlobal(any): void;
  shutdown(): ?Promise<any>;
}

export interface InternalCoreApi extends CoreApi {
  __logger: any;
  __config: any;
  __actions: { [string]: any };
  __hooks: { [string]: InternalHookApi };
  __serverApi: ?ServerApi;
  __rootDir: ?string;
  __events: any;
  __mixins: { [string]: { [string]: Mixin } };
  __middlewares: Array<Middleware>;
}
 */

export default class Core extends EventEmitter /*:: implements InternalCoreApi */ {

  __config = {}
  __actions = {}
  __hooks = {}
  __serverApi = null
  __rootDir = null
  __events = {}
  __mixins = {}
  __middlewares = []
  __logger = signale
  __actionCallContext = {}
  __tasks = {}

  constructor({ serverApi, rootDir, options } /*: ConstructorArguments */) {
    super()
    this.__serverApi = serverApi
    this.__rootDir = rootDir
    this.__config = _.merge(
      defaultConfig,
      options
    )
    this.__events = {
      ...FrameworkEvents
    }
    this.__logger = new Signale({
      scope: ['core'],
      types: {
        trace: {
          badge: '**',
          color: 'red',
          label: 'trace'
        }
      }
    })
    const ActionCallContext = utilMixin(class {})
    const actionCallContext = new ActionCallContext()
    actionCallContext.__frameworkCore = this
    actionCallContext.__logger = this.__logger.scope('action')
    this.__actionCallContext = actionCallContext

    // eport mixin to global
    this.__mixins.core = {
      utilMixin: this.__wrapMixin(utilMixin)
    }
  }

  on(event /*: any */, listenFn /*: Function */) /*: this */ {
    return super.on(event, listenFn)
  }

  emit(event /*: any */, ...args /*: Array<any> */) /*: boolean */ {
    return super.emit(event, ...args)
  }

  get({ path, actionFn } /*: RouteFunctionArguments */) {
    if (!this.__serverApi) return
    this.__serverApi.get(path, async (req /*: Req */, res /*: Res */, next /*: NextFn */) => {
      return await this.__wrapActionFn(actionFn)(req, res, next)
    })
  }

  post({ path, actionFn } /*: RouteFunctionArguments */) {
    if (!this.__serverApi) return
    this.__serverApi.post(path, async (req /*: Req */, res /*: Res */, next /*: NextFn */) => {
      return await this.__wrapActionFn(actionFn)(req, res, next)
    })
  }

  put({ path, actionFn } /*: RouteFunctionArguments */) {
    if (!this.__serverApi) return
    this.__serverApi.put(path, async (req /*: Req */, res /*: Res */, next /*: NextFn */) => {
      return await this.__wrapActionFn(actionFn)(req, res, next)
    })
  }

  delete({ path, actionFn } /*: RouteFunctionArguments */) {
    if (!this.__serverApi) return
    this.__serverApi.delete(path, async (req /*: Req */, res /*: Res */, next /*: NextFn */) => {
      return await this.__wrapActionFn(actionFn)(req, res, next)
    })
  }

  play(port /*: number */, messageFn /*: () => void */) {
    if (!this.__serverApi) return
    this.__serverApi.listen(port, messageFn)
  }

  __wrapActionFn(actionFn /*: ActionFn */) {
    return async (req /*: Req */, res /*: Res */, next /*: NextFn */) => {
      this.__logger.info(`A Request to ${req.path}.`)
      try {
        await actionFn.call(this.__actionCallContext, req, res)
      } catch (e) {
        this.emit(this.__events.core.didHappenError, e)
        if (res.headersSent) return next(e)
        res.status(500)
        res.render('error', { statusCode: 500 })
      }
    }
  }

  reloadGlobal() {
    this.__unloadBaseFromGlobal()
    this.__loadBaseToGlobal()
  }

  __loadBaseToGlobal() {
    this.__loadCoreToGlobal()
  }

  __unloadBaseFromGlobal() {
    this.__unloadCoreFromGlobal()
  }

  __loadCoreToGlobal() {
    this.loadObjectToGlobal({
      [this.__config.app.globalName]: this
    })
  }

  __unloadCoreFromGlobal() {
    this.unloadObjectFromGlobal({
      [this.__config.app.globalName]: this
    })
  }

  __wrapMixin(mixin /*: Mixin */) /*: Mixin */ {
    return Base => isClass(Base) ? mixin(Base) : mixin(class {})
  }

  loadObjectToGlobal(obj /*: any */, ...prefixes /*: Array<string> */) {
    let globalTarget = global
    if (prefixes) {
      for (let prefix of prefixes) {
        if (!globalTarget[prefix]) {
          globalTarget[prefix] = {}
        }
        globalTarget = globalTarget[prefix]
      }
    }
    for (let name in obj) {
      const prop = obj[name]
      globalTarget[name] = prop
    }
  }

  unloadObjectFromGlobal(obj /*: any */, ...prefixes /*: Array<string> */) {
    let globalTarget = global
    if (prefixes && prefixes[0]) {
      globalTarget = globalTarget[prefixes[0]]
    }

    if (!globalTarget) return

    for (let name in obj) {
      delete globalTarget[name]
    }
  }

  async __loadAppFiles() {
    await this.__loadConfigFiles()
    await this.__loadAppTasks()
    await this.__loadAppHooks()
    await this.__loadAppActions()
  }

  async __loadConfigFiles() {
    try {
      const config = (await readmodules(this.__rootDir, 'config'))
      _.merge(this.__config, config)
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }
  }


  async __loadAppActions() {
    let actions /*: any */ = {}
    try {
      actions = await readmodules(this.__rootDir, [ this.__config.app.appDir, this.__config.app.actionsDir ], { useIndex: false })
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }

    this.loadActions(actions)
  }

  loadActions(actions /*: any */) {
    mapKeysDeep(actions, (action, actionName, _obj, nestKeys) => {
      if (_.isFunction(action)) {
        let obj = this.__actions
        for (let key of nestKeys) {
          if (!obj[key]) obj[key] = {}
          obj = obj[key]
        }
        obj[actionName] = action
      }
    })
  }

  async __loadAppHooks() {
    let hooks /*: any */ = {}
    try {
      hooks = await readmodules(this.__rootDir, [ this.__config.app.appDir, this.__config.app.hooksDir ])
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }

    this.loadHooks(hooks)
  }

  loadHooks(hooks /*: any */) {
    for (let name in hooks) {
      try {
        this.__loadHook(name, hooks[name])
      } catch (e) {
        this.emit(this.__events.core.didHappenError, e)
      }
    }
  }

  __loadHook(hookName /*: string */, hookClass /*: any */) {
    if (!hookClass) return

    const regularHookName = _.camelCase(hookName)

    try {
      hookClass = utilMixin(hookClass)
      const hook = new hookClass()
      hook.__name = regularHookName
      hook.__frameworkCore = this
      hook.__logger = this.__logger.scope('hook', regularHookName)
      this.__hooks[regularHookName] = hook
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      throw e
    }
  }

  async __loadAppTasks() {
    let taskfiles /*: { [string]: string } */ = {}
    try {
      taskfiles = this.__rootDir ? globfiles(this.__rootDir) : {}
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }

    this.loadTasks(taskfiles)
  }

  loadTasks(taskfiles /*: { [string]: string } */) {
    for (let taskfilename in taskfiles) {
      try {
        this.__loadTask(taskfilename, taskfiles[taskfilename])
      } catch (e) {
        this.emit(this.__events.core.didHappenError, e)
      }
    }
  }

  __loadTask(taskfilename /*: string */, taskfilepath /*: string */) {
    if (!taskfilename || !taskfilepath) return

    const regularTaskName = _.camelCase(taskfilename)

    this.__tasks[regularTaskName] = function(input) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, 'taskRunner.js'), {
          workerData: {
            taskname: regularTaskName,
            filename: taskfilepath,
            input
          }
        })

        worker.on('message', resolve)
        worker.on('error', reject)
        worker.on('exit', (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`))
        })
      })
    }
  }

  bootstrap() {
    try {
      this.__loadBaseToGlobal()
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      throw e
    }
  }

  async initialize() {
    try {
      this.__callHookDefaultsMethods()
      this.__callHookConfigureMethods()
      await this.__callHookInitializeMethods()
      this.__callHookRegisterMixinsMethods()
      this.__callHookRegisterActionsMethods()
      this.__callHookBindActionsToRoutesMethods()
      this.__checkAllHooksLoadedSuccessfully()
      await this.__loadAppFiles()
      this.__applyLoadedConfig()
      this.__bindActionsToRoutes()
      this.reloadGlobal()
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      throw e
    }
  }

  __applyLoadedConfig() {
    if (!this.__serverApi) return
    const serverApi = this.__serverApi
    this.__configureServerApi({ serverApi })
    console.log(this.__middlewares)
    for (let middleware of this.__middlewares) {
      serverApi.use(middleware)
    }
  }

  __configureServerApi({ serverApi } /*: { serverApi: ServerApi } */) {
    this.__configureViewEngine({ serverApi })
    this.__configureViews({ serverApi })
    this.__configureBodyParser( { serverApi })
  }

  __configureViewEngine({ serverApi } /*: { serverApi: ServerApi } */) {
    if (!this.__config.viewTemplate.engine) return
    if (!this.__config.app.viewEngines.includes(this.__config.viewTemplate.engine)) return
    serverApi.set('view engine', this.__config.viewTemplate.engine)
  }

  __configureViews({ serverApi } /*: { serverApi: ServerApi } */) {
    if (!this.__config.app.viewsDirs) return
    serverApi.set('views', this.__config.app.viewsDirs)
  }

  __configureBodyParser({ serverApi } /*: { serverApi: ServerApi } */) {
    serverApi.use(bodyParser.json())
    serverApi.use(bodyParser.urlencoded({ extended: true }))
  }

  __bindActionsToRoutes() {
    for (let route in this.__config.routes) {
      const [_method, path] = route.split(' ')
      const method = _method.toLowerCase()
      const actionNamePath = this.__config.routes[route]
      const actionFn = _.get(this.__actions, actionNamePath)
      this.__logger.debug(`Bind ${actionNamePath} to ${path}.`)
      switch (method) {
        case 'get':
          this.get({ path, actionFn })
          break
        case 'post':
          this.post({ path, actionFn })
          break
        case 'put':
          this.put({ path, actionFn })
          break
        case 'del':
          this.delete({ path, actionFn })
          break
      }
    }
    this.__bind404ActionsToRoutes()
  }

  __bind404ActionsToRoutes() {
    if (!this.__serverApi) return
    const serverApi = this.__serverApi
    serverApi.use((req /*: Req */, res /*: Res */, next /*: NextFn */) => {
      if (res.headersSent) return
      this.emit(this.__events.core.didHappenError, new Error(`Route(${req.path}) has not an action.`))
      res.status(404)
      res.render('error', { statusCode: 404 })
    })
  }

  __callHookDefaultsMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.defaults) return
      try {
        if (!this.__config.hook[hookName]) this.__config.hook[hookName] = {}
        _.merge(this.__config.hook, { [hookName]: hook.defaults() })
      } catch (e) {
        hook.__err = e
      }
    }
  }

  __callHookConfigureMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.configure) return
      try {
        if (!this.__config.hook[hookName]) this.__config.hook[hookName] = {}
        _.merge(this.__config.hook, { [hookName]: hook.configure() })
      } catch (e) {
        hook.__err = e
      }
    }
  }

  __callHookRegisterMixinsMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.registerMixins) return
      try {
        const mixins /*: { [string]: Mixin } */ = hook.registerMixins()
        this.__mixins[hookName] = {}
        for (let mixinName in mixins) {
          const mixin /*: Mixin */ = mixins[mixinName]
          this.__mixins[hookName][mixinName] = this.__wrapMixin(mixin)
        }
      } catch (e) {
        hook.__err = e
      }
    }
  }

  __callHookRegisterActionsMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.registerActions) return
      try {
        this.loadActions(hook.registerActions())
      } catch (e) {
        hook.__err = e
      }
    }
  }


  __callHookBindActionsToRoutesMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.bindActionsToRoutes) return
      try {
        const routes = hook.bindActionsToRoutes()
        _.merge(routes, this.__config.routes)
        _.merge(this.__config.routes, routes)
      } catch (e) {
        hook.__err = e
      }
    }
  }

  async __callHookInitializeMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.initialize) return
      try {
        await hook.initialize()
      } catch (e) {
        hook.__err = e
      }
    }
  }

  async shutdown() {
    await this.__callHookTeardownMethods()
  }

  async __callHookTeardownMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.teardown) return
      try {
        await hook.teardown()
      } catch (e) {
        hook.__err = e
      }
    }
  }

  __checkAllHooksLoadedSuccessfully() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (hook.__err) {
        this.__logger.error(hook.__err)
        this.emit(this.__events.core.hookFailedLoad, { hookName: hook.__name, err: hook.__err })
      } else {
        this.emit(this.__events.core.hookSucceededLoad, { hookName: hook.__name })
      }
      hook.__isLoaded = true
    }
  }
}
