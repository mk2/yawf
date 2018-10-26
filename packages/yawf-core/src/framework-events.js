export default {

  /*
   * Core Events
   */
  core: {
    willBoot: Symbol(),
    willSetup: Symbol(),
    didSetup: Symbol(),
    didBoot: Symbol(),
    ready: Symbol(),
    didHappenError: Symbol()
  },

  /*
   * Hook Events
   */
  hook: {},

  /*
   * Custom Events
   */
  custom: {}
}
