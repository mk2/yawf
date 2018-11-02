// @flow

/*::
export interface HookApi {
  defaults(): any;
  configure(): any;
  initialize(): ?Promise<any>;
  registerActions(): void;
  bindActionsToRoutes(): void;
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

  defaults() {
    return {}
  }

  configure() {
    return {}
  }

  async initialize() {
  }


  registerActions() {
  }

  bindActionsToRoutes() {
  }

}
