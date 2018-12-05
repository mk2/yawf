// @flow

/*::

export interface FuncApi {
  run();
}

export interface InternalFuncApi extends FuncApi {
}
 */

export default class Reducer /*:: implements InternalFuncApi */ {

  __name = null

  async run(...args) {
    this.setup(...args)
    await this.execute()
    return this.finish()
  }

  setup(...args) {
  }

  async execute() {
  }

  finish() {
  }

}
