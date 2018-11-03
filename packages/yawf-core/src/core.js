// @flow

import EventEmitter from 'events'
import FrameworkEvents from './framework-events'
import path from 'path'
import { fs } from './util'
import _ from 'lodash'
import { readfiles, isClass, mapKeysDeep } from './util'
import appUtils from './forApp/util'
import defaultConfig from './config'
import signale, { Signale } from 'signale'
import logger from './forApp/logger'

/*::
import type { $Application, $Request, $Response, NextFunction, Middleware } from 'express'
import express from 'express'
import { InternalHookApi } from './forApp/hook'

export type Path = string | RegExp
export type ServerApi = $Application
export type Req = $Request
export type Res = $Response
export type NextFn = NextFunction

type CoreStartOptions = {
  hateGlobal: boolean
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
  +global: any;
}

export interface InternalCoreApi extends CoreApi {
  __global: any;
  __logger: any;
  __config: any;
  __actions: { [string]: any };
  __hooks: { [string]: InternalHookApi };
  __serverApi: ?ServerApi;
  __rootDir: ?string;
  __events: any;
  __middlewares: Array<Middleware>;
}
 */

export default class extends EventEmitter /*:: implements InternalCoreApi */ {

  __global = {}
  __config = {}
  __actions = {}
  __hooks = {}
  __serverApi = null
  __rootDir = null
  __events = {}
  __middlewares = []
  __logger = signale

  constructor({ serverApi, rootDir, options } /*: ConstructorArguments */) {
    super()
    this.__serverApi = serverApi
    this.__rootDir = rootDir
    this.__config = {
      ...defaultConfig,
      ...options
    }
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
  }

  get global() {
    return this.__global
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
      try {
        await actionFn.call(actionFn, req, res)
        return next()
      } catch (e) {
        this.emit(this.__events.core.didHappenError, e)
        if (res.headersSent) return next(e)
        res.status(500)
        res.render('error', { statusCode: 500 })
        return next()
      }
    }
  }

  reloadGlobal() {
    this.__unloadBaseFromGlobal()
    this.__loadBaseToGlobal()
  }

  __loadBaseToGlobal() {
    this.__loadCoreToGlobal()
    this.__loadUtilityMethodsToGlobal()
  }

  __unloadBaseFromGlobal() {
    this.__unloadUtilityMethodsFromGlobal()
    this.__unloadCoreFromGlobal()
  }

  __loadCoreToGlobal() {
    if (this.__config.hateGlobal) return
    this.loadObjectToGlobal({
      [this.__config.app.globalName]: this
    })
  }

  __unloadCoreFromGlobal() {
    if (this.__config.hateGlobal) return
    this.unloadObjectFromGlobal({
      [this.__config.app.globalName]: this
    })
  }

  __loadUtilityMethodsToGlobal() {
    this.loadObjectToGlobal(appUtils)
  }

  __unloadUtilityMethodsFromGlobal() {
    this.unloadObjectFromGlobal(appUtils)
  }

  loadObjectToGlobal(obj /*: any */, ...prefixes /*: Array<string> */) {
    let globalTarget = global
    let nonGlobalTarget = this.__global
    if (prefixes) {
      for (let prefix of prefixes) {
        if (!globalTarget[prefix]) {
          globalTarget[prefix] = {}
        }
        if (!nonGlobalTarget[prefix]) {
          nonGlobalTarget[prefix] = {}
        }
        globalTarget = globalTarget[prefix]
        nonGlobalTarget = nonGlobalTarget[prefix]
      }
    }
    for (let name in obj) {
      const prop = obj[name]
      const addProp = (_global, _prop) => {
        Object.defineProperty(_global, name, {
          configurable: true,
          enumerable: true,
          get() {
            return typeof _prop === 'function' ? _prop(_global) : _prop
          }
        })
      }
      addProp(nonGlobalTarget, prop)
      if (!this.__config.hateGlobal) {
        addProp(globalTarget, prop)
      }
    }
  }

  unloadObjectFromGlobal(obj /*: any */, prefixes /*: ?Array<string> */) {
    let globalTarget = global
    let nonGlobalTarget = this.__global
    if (prefixes && prefixes[0]) {
      globalTarget = globalTarget[prefixes[0]]
      nonGlobalTarget = nonGlobalTarget[prefixes[0]]
    }
    for (let name in obj) {
      delete nonGlobalTarget[name]
      if (!this.__config.hateGlobal) {
        delete globalTarget[name]
      }
    }
  }

  async __loadAppFiles() {
    await this.__loadConfigFiles()
    await this.__loadAppHooks()
    await this.__loadAppActions()
  }

  async __loadConfigFiles() {
    try {
      const config = (await readfiles(this.__rootDir, 'config'))
      _.merge(this.__config, config)
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }
  }


  async __loadAppActions() {
    let actions /*: any */ = {}
    try {
      actions = await readfiles(this.__rootDir, [ this.__config.app.appDir, this.__config.app.actionsDir ], { useIndex: false })
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }
    
    this.loadActions(actions)
  }

  loadActions(actions /*: any */) {
    mapKeysDeep(actions, (action, actionName, _obj, nestKeys) => {
      if (_.isFunction(action)) {
        if (this.__config.hateGlobal) {
          actions.__proto__['global'] = this.global
        }

        let obj = this.__actions
        for (let key of nestKeys) {
          if (!obj[key]) obj[key] = {}
          obj = obj[key]
        }
        if (_.isFunction(action)) {
          _.mergeWith(action.__proto__, logger, (objValue, srcValue) => {
            if (objValue) return objValue
            return srcValue.bind(action)
          })
          action.__proto__['__logger'] = this.__logger.scope('action', actionName)
          obj[actionName] = action
        }
      }
    })
  }

  async __loadAppHooks() {
    let hooks /*: any */ = {}
    try {
      hooks = await readfiles(this.__rootDir, [ this.__config.app.appDir, this.__config.app.hooksDir ])
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
    const regularHookName = _.camelCase(hookName)
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Load.Succeeded}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Load.Failed}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Load.Did}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Defaults.Will}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Defaults.Succeeded}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Defaults.Failed}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Defaults.Did}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Initialize.Will}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Initialize.Succeeded}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Initialize.Failed}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Initialize.Did}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Configure.Will}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Configure.Succeeded}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Configure.Failed}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.Configure.Did}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.RegisterActions.Will}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.RegisterActions.Succeeded}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.RegisterActions.Failed}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.RegisterActions.Did}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.BindActionsToRoutes.Will}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.BindActionsToRoutes.Succeeded}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.BindActionsToRoutes.Failed}`] = Symbol()
    this.__events.hook[`${regularHookName}${this.__config.hookEventName.BindActionsToRoutes.Did}`] = Symbol()

    if (this.__config.hateGlobal) {
      hookClass.prototype['global'] = this.global
    }
    try {
      const hook = new hookClass()
      hook.__name = regularHookName
      _.mergeWith(hook.__proto__, logger, (objValue, srcValue) => {
        if (objValue) return objValue
        return srcValue.bind(hook)
      })
      hook.__logger = this.__logger.scope('hook', hook.__name)
      this.__hooks[regularHookName] = hook
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      throw e
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
      await this.__loadAppFiles()
      await this.__callHookInitializeMethods()
      this.__callHookRegisterActionsMethods()
      this.__callHookBindActionsToRoutesMethods()
      this.__checkAllHooksLoadedSuccessfully()
      this.__applyLoadedConfig()
      this.__bindActionsToRoutes()
      this.reloadGlobal()
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      throw e
    }
  }

  __applyLoadedConfig() {
    this.__configureViewEngine()
    this.__configureViews()
    if (this.__serverApi) {
      for (let middleware of this.__middlewares) {
        this.__serverApi.use(middleware)
      }
    }
  }

  __configureViewEngine() {
    if (!this.__config.viewTemplate.engine) return
    if (!this.__config.app.viewEngines.includes(this.__config.viewTemplate.engine)) return
    if (!this.__serverApi) return

    this.__serverApi.set('view engine', this.__config.viewTemplate.engine)
  }

  __configureViews() {
    if (!this.__config.app.viewsDirs) return
    if (!this.__serverApi) return

    this.__serverApi.set('views', this.__config.app.viewsDirs)
  }

  __bindActionsToRoutes() {
    for (let route in this.__config.routes) {
      const [_method, path] = route.split(' ')
      const method = _method.toLowerCase()
      const actionNamePath = this.__config.routes[route]
      const actionFn = _.get(this.__actions, actionNamePath)
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
    const path = '*'
    const actionFn = (req, res) => {
      if (res.headersSent) return
      this.emit(this.__events.core.didHappenError, new Error(`Route(${req.path}) has not an action.`))
      res.status(404)
      res.render('error', { statusCode: 404 })
    }
    this.get({ path, actionFn })
    this.post({ path, actionFn })
    this.put({ path, actionFn })
    this.delete({ path, actionFn })
  }

  __callHookDefaultsMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.defaults) return
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Defaults.Will}`])
      try {
        if (!this.__config.hook[hookName]) this.__config.hook[hookName] = {}
        _.merge(this.__config.hook, { [hookName]: hook.defaults() })
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Defaults.Succeeded}`])
      } catch (e) {
        hook.__err = e
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Defaults.Failed}`], e)
        this.emit(this.__events.core.didHappenError, e)
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Defaults.Did}`])
    }
  }

  __callHookConfigureMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.configure) return
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Configure.Will}`])
      try {
        if (!this.__config.hook[hookName]) this.__config.hook[hookName] = {}
        _.merge(this.__config.hook, { [hookName]: hook.configure() })
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Configure.Succeeded}`])
      } catch (e) {
        hook.__err = e
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Configure.Failed}`], e)
        this.emit(this.__events.core.didHappenError, e)
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Configure.Did}`])
    }
  }

  __callHookRegisterActionsMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.registerActions) return
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.RegisterActions.Will}`])
      try {
        this.loadActions(hook.registerActions())
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.RegisterActions.Succeeded}`])
      } catch (e) {
        hook.__err = e
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.RegisterActions.Failed}`], e)
        this.emit(this.__events.core.didHappenError, e)
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.RegisterActions.Did}`])
    }
  }


  __callHookBindActionsToRoutesMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.bindActionsToRoutes) return
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.BindActionsToRoutes.Will}`])
      try {
        const routes = hook.bindActionsToRoutes()
        _.merge(routes, this.__config.routes)
        _.merge(this.__config.routes, routes)
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.BindActionsToRoutes.Succeeded}`])
      } catch (e) {
        hook.__err = e
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.BindActionsToRoutes.Failed}`], e)
        this.emit(this.__events.core.didHappenError, e)
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.BindActionsToRoutes.Did}`])
    }
  }

  async __callHookInitializeMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.initialize) return
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Initialize.Will}`])
      try {
        await hook.initialize()
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Initialize.Succeeded}`])
      } catch (e) {
        hook.__err = e
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Initialize.Failed}`], e)
        this.emit(this.__events.core.didHappenError, e)
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Initialize.Did}`])
    }
  }

  __checkAllHooksLoadedSuccessfully() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (hook.__err) {
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Load.Failed}`], hook.__err)
        this.emit(this.__events.core.hookFailedLoad, { hookName: hook.__name, err: hook.__err })
      } else {
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Load.Succeeded}`])
        this.emit(this.__events.core.hookSucceededLoad, { hookName: hook.__name })
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Load.Did}`])
      hook.__isLoaded = true
    }
  }
}
