// @flow

/*::

export interface HookApi {
  defaults(): any;
  configure(): any;
  initialize(): ?Promise<any>;
  registerMixins(): { [string]: (Class<any>) => Class<any> };
  registerActions(): any;
  bindActionsToRoutes(): any;
  teardown(): ?Promise<any>;
}

export interface InternalHookApi extends HookApi {
  __name: ?string;
  __isLoaded: boolean;
  __err: ?Error;
}
 */

export default class Hook /*:: implements InternalHookApi */ {

  __name = null
  __isLoaded = false
  __err = null
  __logger = null

  defaults() {
    return {}
  }

  configure() {
    return {}
  }

  async initialize() {
  }

  registerMixins() {
    return {}
  }

  registerActions() {
    return {}
  }

  bindActionsToRoutes() {
    return {}
  }

  async teardown() {
  }

}
