// @flow
import { Starter } from '@yawf/yawf-core'
import coreHooks from '@yawf/yawf-core-hooks'

export { Hook as Hook } from '@yawf/yawf-core'

export async function start() {
  const starter = new Starter()
  starter.core.on(starter.events.core.didHappenError, (e) => {
    starter.logger.error(e)
  })
  await starter.bootstrap()
  loadCoreHooks(starter.core)
  await starter.initialize()
  starter.start()
}

function loadCoreHooks(core) {
  core.loadHooks(coreHooks)
}
