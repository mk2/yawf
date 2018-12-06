const { Task } = require('@yawf/yawf')

module.exports = class extends Task {
  async execute() {
    this.$debug('hello world')
  }
}
