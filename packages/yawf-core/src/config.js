export default {

  /*
   * configs
   */
  app: {
    isProduction: false,
    environment: 'development',
    globalName: '__frameworkCore',
    configDir: 'config',
    appDir: 'server',
    actionsDir: 'actions',
    hooksDir: 'hooks',
    tasksDir: 'tasks',
    viewEngines: ['pug'],
    clientDir: 'client',
    viewsDirs: ['client', 'views']
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
    RegisterMixins: {
      Will: 'WillCallRegisterMixins',
      Succeeded: 'SucceededCallRegisterMixins',
      Failed: 'FailedCallRegisterMixins',
      Did: 'DidCallRegisterMixins'
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
