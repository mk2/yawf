export default {
  /*
   * options
   */
  hateGlobal: false,

  /*
   * configs
   */
  app: {
    globalName: '__frameworkCore',
    configDir: 'config',
    appDir: 'app',
    controllersDir: 'controllers',
    helpersDir: 'helpers',
    hooksDir: 'hooks',
    viewEngines: ['pug']
  },
  hook: {},
  hookEventName: {
    Load: {
      Succeeded: 'SucceededLoad',
      Failed: 'FailedLoad',
      Did: 'DidLoad'
    },
    Defaults: {
      Will: 'WillCallDefaults',
      Succeeded: 'SucceededCallDefaults',
      Failed: 'FailedCallDefaults',
      Did: 'DidCallDefaults',
    },
    Initialize: {
      Will: 'WillCallInitialize',
      Succeeded: 'SucceededCallInitialize',
      Failed: 'FailedCallInitialize',
      Did: 'DidCallInitialize'
    },
    Configure: {
      Will: 'WillCallConfigure',
      Succeeded: 'SucceededCallConfigure',
      Failed: 'FailedCallConfigure',
      Did: 'DidCallConfigure'
    },
    RegisterActions: {
      Will: 'WillCallRegisterActions',
      Succeeded: 'SucceededCallRegisterActions',
      Failed: 'FailedCallRegisterActions',
      Did: 'DidCallRegisterActions'
    },
    BindActionsToRoutes: {
      Will: 'WillCallBindActionsToRoutes',
      Succeeded: 'SucceededCallBindActionsToRoutes',
      Failed: 'FailedCallBindActionsToRoutes',
      Did: 'DidCallBindActionsToRoutes'
    }
  }
}
