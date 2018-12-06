const Task = require('../../lib/forApp/task')

module.exports = class extends Task {

  static inputSchema(S) {
    return S.object().keys({
      name: S.string()
    })
  }

  static outputSchema(S) {
    return S.string()
  }

  async execute({ input }) {
    const { name } = input
    return `I am ${name}.`
  }
}
