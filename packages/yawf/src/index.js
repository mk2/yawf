// @flow
import { Starter } from '@yawf/yawf-core'
import coreHooks from '@yawf/yawf-core-hooks'

import Hook from '@yawf/yawf-core'

/*::
export type YawfOptions = {
  useCoreHooks: boolean
}
 */

async function yawf(options /*: YawfOptions */) {
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

export default {
  Hook,
  yawf,
  get mixins() {
    return global.__frameworkCore.__mixins
  }
}
