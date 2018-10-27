export default {

  /*
   * Core Events
   */
  core: {
    willBootstrap: Symbol(),
    didBootstrap: Symbol(),
    willInitialize: Symbol(),
    didInitialize: Symbol(),
    willStart: Symbol(),
    didStart: Symbol(),
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
