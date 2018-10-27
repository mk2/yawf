// @flow

import '@babel/register'
import EventEmitter from 'events'
import FrameworkEvents from './framework-events'
import path from 'path'
import { fs } from './util'
import _ from 'lodash'
import { loadFiles } from './util'
import appUtils from './forApp/util'
import config from './config'

/*::
import type { $Application, $Request, $Response, NextFunction } from 'express'
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
  play(number, () => void): void;
  reloadGlobal(): void;
  loadAppFiles(): ?Promise<any>;
  setup(): ?Promise<any>;
  loadHooks({ [string]: InternalHookApi }): void;
  on(any, Function): CoreApi;
  emit(any, ...args: Array<any>): boolean;
}

export interface InternalCoreApi extends CoreApi {
  __global: any;
  __logger: any;
  __config: any;
  __actions: { [string]: any };
  __helpers: { [string]: any };
  __hooks: { [string]: InternalHookApi };
  __serverApi: ?ServerApi;
  __rootDir: ?string;
  __events: any;
}
 */

export default class extends EventEmitter /*:: implements InternalCoreApi */ {

  __global /*: any */ = {}
  __logger /*: any */ = console
  __config /*: any */ = {}
  __actions /*: { [string]: any } */ = {}
  __helpers /*: { [string]: any } */ = {}
  __hooks /*: { [string]: InternalHookApi } */ = {}
  __serverApi /*: ?ServerApi */ = null
  __rootDir /*: ?string */ = null
  __events /*: any */ = {}

  constructor({ serverApi, rootDir, options } /*: ConstructorArguments */) {
    super()
    this.__serverApi = serverApi
    this.__rootDir = rootDir
    this.__config = {
      ...config,
      ...options
    }
    this.__events = {
      ...FrameworkEvents
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
      await this.wrapActionFnWithCustomGlobal(actionFn)(req, res)
      return next()
    })
  }

  post({ path, actionFn } /*: RouteFunctionArguments */) {
    if (!this.__serverApi) return
    this.__serverApi.post(path, async (req /*: Req */, res /*: Res */, next /*: NextFn */) => {
      await this.wrapActionFnWithCustomGlobal(actionFn)(req, res)
      return next()
    })
  }

  put({ path, actionFn } /*: RouteFunctionArguments */) {
    if (!this.__serverApi) return
    this.__serverApi.put(path, async (req /*: Req */, res /*: Res */, next /*: NextFn */) => {
      await this.wrapActionFnWithCustomGlobal(actionFn)(req, res)
      return next()
    })
  }

  delete({ path, actionFn } /*: RouteFunctionArguments */) {
    if (!this.__serverApi) return
    this.__serverApi.delete(path, async (req /*: Req */, res /*: Res */, next /*: NextFn */) => {
      await this.wrapActionFnWithCustomGlobal(actionFn)(req, res)
      return next()
    })
  }

  play(port /*: number */, messageFn /*: () => void */) {
    if (!this.__serverApi) return
    this.__serverApi.listen(port, messageFn)
  }

  wrapActionFnWithCustomGlobal(actionFn /*: ActionFn */) {
    return async (req /*: any */, res /*: any */) => {
      try {
        await actionFn(req, res)
      } catch (e) {
        // do nothing
      }
    }
  }

  reloadGlobal() {
    this.unloadFromGlobal()
    this.loadToGlobal()
  }

  loadToGlobal() {
    this.loadCoreToGlobal()
    this.loadUtilityMethodsToGlobal()
    this.loadHelpersToGlobal()
  }

  unloadFromGlobal() {
    this.unloadHelpersFromGlobal()
    this.unloadUtilityMethodsFromGlobal()
    this.unloadCoreFromGlobal()
  }

  loadCoreToGlobal() {
    global[this.__config.app.globalName] = this
  }

  unloadCoreFromGlobal() {
    delete global[this.__config.app.globalName]
  }

  loadUtilityMethodsToGlobal() {
    this.loadObjectToGlobal(appUtils)
  }

  unloadUtilityMethodsFromGlobal() {
    this.unloadObjectFromGlobal(appUtils)
  }

  loadHelpersToGlobal() {
    this.loadObjectToGlobal(this.__helpers)
  }

  unloadHelpersFromGlobal() {
    this.unloadObjectFromGlobal(this.__helpers)
  }

  loadObjectToGlobal(obj /*: any */, prefixes /*: ?Array<string> */) {
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
      nonGlobalTarget[name] = obj[name]
      if (!this.__config.hateGlobal) {
        globalTarget[name] = obj[name]
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

  async loadAppFiles() {
    await this.loadConfigFiles()
    await this.loadAppHooks()
    await this.loadAppControllers()
    await this.loadAppHelpers()
  }

  async loadConfigFiles() {
    try {
      const config = await loadFiles(this.__rootDir, this.__config.app.configDir)
      this.__config = {
        ...this.__config,
        ...config
      }
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }
  }


  async loadAppControllers() {
    let actions /*: any */ = {}
    try {
      actions = await loadFiles(this.__rootDir, this.__config.app.appDir, this.__config.app.controllersDir)
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }

    for (let name in actions) {
      this.__actions[name] = new actions[name]()
    }
  }

  async loadAppHooks() {
    let hooks /*: any */ = {}
    try {
      hooks = await loadFiles(this.__rootDir, this.__config.app.appDir, this.__config.app.hooksDir)
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }

    this.loadHooks(hooks)
  }

  async loadAppHelpers() {
    let helpers /*: any */ = {}
    try {
      helpers = await loadFiles(this.__rootDir, this.__config.app.appDir, this.__config.app.helpersDir)
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      return
    }

    for (let name in helpers) {
      this.__helpers[_.upperFirst(name)] = helpers[name]
    }
  }

  loadHooks(hooks /*: any */) {
    for (let name in hooks) {
      try {
        this.loadHook(name, hooks[name])
      } catch (e) {
        this.emit(this.__events.core.didHappenError, e)
      }
    }
  }

  loadHook(hookName /*: string */, hookClass /*: any */) {
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

    try {
      const hook = new hookClass()
      hook.__name = regularHookName
      this.__hooks[regularHookName] = hook
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      throw e
    }
  }

  bindActionsToRoutes() {
    for (let route in this.__config.routes) {
      const [_method, path] = route.split(' ')
      const [clazz, clazzMethod] = this.__config.routes[route].split('.')
      const method = _method.toLowerCase()
      const actionClazz = this.__actions[clazz]
      const actionFn = this.__actions[clazz][clazzMethod].bind(actionClazz)
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
  }

  configureViewEngine() {
    if (!this.__config.viewTemplate.engine) return
    if (!this.__config.app.viewEngines.includes(this.__config.viewTemplate.engine)) return

    if (!this.__serverApi) return
    this.__serverApi.set('view engine', this.__config.viewTemplate.engine)
  }

  async setup() {
    try {
      await this.loadAppFiles()
      this.loadToGlobal()
      this.callHookDefaultsMethods()
      this.configure()
      this.callHookConfigureMethods()
      await this.callHookInitializeMethods()
      this.callHookRegisterActionsMethods()
      this.callHookBindActionsToRoutesMethods()
      this.checkAllHooksLoadedSuccessfully()
      this.bindActionsToRoutes()
    } catch (e) {
      this.emit(this.__events.core.didHappenError, e)
      throw e
    }
  }

  configure() {
    this.configureViewEngine()
  }

  callHookDefaultsMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.defaults) return
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Defaults.Will}`])
      try {
        this.__config.hook[hookName] = hook.defaults()
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Defaults.Succeeded}`])
      } catch (e) {
        hook.__err = e
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Defaults.Failed}`], e)
        this.emit(this.__events.core.didHappenError, e)
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Defaults.Did}`])
    }
  }

  callHookConfigureMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.configure) return
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Configure.Will}`])
      try {
        this.__config.hook[hookName] = {
          ...this.__config.hook[hookName],
          ...hook.configure()
        }
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Configure.Succeeded}`])
      } catch (e) {
        hook.__err = e
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Configure.Failed}`], e)
        this.emit(this.__events.core.didHappenError, e)
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Configure.Did}`])
    }
  }

  callHookRegisterActionsMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.registerActions) return
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.RegisterActions.Will}`])
      try {
        hook.registerActions()
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.RegisterActions.Succeeded}`])
      } catch (e) {
        hook.__err = e
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.RegisterActions.Failed}`], e)
        this.emit(this.__events.core.didHappenError, e)
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.RegisterActions.Did}`])
    }
  }


  callHookBindActionsToRoutesMethods() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (!hook.bindActionsToRoutes) return
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.BindActionsToRoutes.Will}`])
      try {
        hook.bindActionsToRoutes()
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.BindActionsToRoutes.Succeeded}`])
      } catch (e) {
        hook.__err = e
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.BindActionsToRoutes.Failed}`], e)
        this.emit(this.__events.core.didHappenError, e)
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.BindActionsToRoutes.Did}`])
    }
  }

  async callHookInitializeMethods() {
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

  checkAllHooksLoadedSuccessfully() {
    for (let hookName in this.__hooks) {
      const hook = this.__hooks[hookName]
      if (hook.__err) {
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Load.Failed}`], hook.__err)
      } else {
        this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Load.Succeeded}`])
      }
      this.emit(this.__events.hook[`${hookName}${this.__config.hookEventName.Load.Did}`])
      hook.__isLoaded = true
    }
  }
}
