// @flow
import { Starter } from '@yawf/yawf-core'
import coreHooks from '@yawf/yawf-core-hooks'

export { Hook as Hook } from '@yawf/yawf-core'

/*::
export type YawfOptions = {
  useCoreHooks: boolean
}
 */

export async function yawf(options /*: YawfOptions */) {
  const useCoreHooks = !!options.useCoreHooks
  const starter = new Starter()
  starter.core.on(starter.events.core.didHappenError, (e) => {
    starter.logger.error(e)
  })
  starter.core.on(starter.events.core.hookSucceededLoad, ({ hookName }) => {
    starter.logger.log(`A hook(${hookName}) was successfully loaded.`)
  })
  starter.core.on(starter.events.core.hookFailedLoad, ({ hookName }) => {
    starter.logger.error(`A hook(${hookName}) was failed to load.`)
  })
  starter.bootstrap()
  if (useCoreHooks) {
    loadCoreHooks(starter.core)
  }
  await starter.initialize()
  return starter
}

function loadCoreHooks(core) {
  core.loadHooks(coreHooks)
}
