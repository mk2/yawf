// @flow
import { Starter } from '@yawf/yawf-core'
import coreHooks from '@yawf/yawf-core-hooks'

import _Hook from '@yawf/yawf-core'
import _Logic from '@yawf/yawf-core'

export const Hook = _Hook
export const Logic = _Logic

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
    starter.logger.success(`A hook(${hookName}) was successfully loaded.`)
  })
  starter.core.on(starter.events.core.hookFailedLoad, ({ hookName }) => {
    starter.logger.fatal(`Error: A hook(${hookName}) was failed to load.`)
  })
  starter.bootstrap()
  if (useCoreHooks) {
    loadCoreHooks(starter.core)
  }
  await starter.initialize()
  starter.core.__logger.complete(`A yawf app started at port ${starter.port}.`)
  starter.core.__logger.complete(`Let's start at http://localhost:${starter.port}`)
  return starter
}

function loadCoreHooks(core) {
  core.loadHooks(coreHooks)
}
