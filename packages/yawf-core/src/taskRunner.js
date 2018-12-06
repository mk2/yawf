const { isMainThread, parentPort, workerData, threadId } = require('worker_threads')
const SchemaValidator = require('joi')
const utilMixin = require('./forApp/utilMixin')

if (!isMainThread) {

  const { taskname, filename, input } = workerData
  const taskClass = utilMixin(require(filename))
  const inputSchema = taskClass.inputSchema(SchemaValidator)
  const outputSchema = taskClass.outputSchema(SchemaValidator)
  const task = new taskClass({ taskname, threadId, inputSchema, outputSchema });

  (async function() {
    try {
      const output = await task.__run(input)
      parentPort.postMessage(output)
    } catch (e) {
      console.error(e)
    }
    parentPort.close()
  })()

}
