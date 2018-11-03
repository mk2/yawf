export default {

  success(...args) {
    this.__logger.success(...args)
  },

  debug(...args) {
    this.__logger.debug(...args)
  },

  log(...args) {
    this.__logger.log(...args)
  },

  error(...args) {
    this.__logger.error(...args)
  },

  fatal(...args) {
    this.__logger.fatal(...args)
  }
}
