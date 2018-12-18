import { Signale } from 'signale'

/*::

export interface TaskApi {
  __run();
}

export interface InternalTaskApi extends TaskApi {
}
 */

export default class Task /*:: implements InternalTaskApi */ {

  __name = null
  __uniqueName = null
  __logger = null
  __inputSchema = null
  __outputSchema = null

  static inputSchema(S) {
    // If use input schema validation, please redefined in child class.
  }

  static outputSchema(S) {
    // If use output schema validation, please redefined in child class.
  }

  constructor({ taskname, threadId, inputSchema, outputSchema }) {
    this.__name = taskname
    this.__uniqueName = `${taskname} #${threadId} (${process.hrtime.bigint()})`
    this.__inputSchema = inputSchema
    this.__outputSchema = outputSchema

    // Due to https://github.com/nodejs/node/issues/24636, Signale library may not be working.
    this.__logger = new Signale({
      scope: [this.__uniqueName]
    })
  }

  async __run(input) {
    const { error: inputError, value: inputValue } = this.__validateInput(input)

    if (inputError) {
      this.$error(`Input validation error: ${inputError}`)
      throw new Error(inputError)
    }

    const output = await this.execute({ input: inputValue })
    const { error: outputError, value: outputValue } = this.__validateOutput(output)

    if (outputError) {
      this.$error(`Output validation error: ${inputError}`)
      throw new Error(outputError)
    }

    return output
  }

  __validateInput(input) {
    if (!this.__inputSchema) return { error: null, value: input }
    return this.__inputSchema.validate(input)
  }

  __validateOutput(output) {
    if (!this.__outputSchema) return { error: null, value: output }
    return this.__outputSchema.validate(output)
  }

  async execute({ input }) {
    throw new Error('Must be override in child class.')
  }

}
