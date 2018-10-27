// @flow

/*::
export interface HookApi {
  defaults(): any;
  initialize(): ?Promise<any>;
  configure(): void;
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

  __name /*: ?string */ = null
  __isLoaded /*: boolean */ = false
  __err /*: ?Error */ = null

  defaults() {
  }

  async initialize() {
  }

  configure() {
  }

  registerActions() {
  }

  bindActionsToRoutes() {
  }

}
