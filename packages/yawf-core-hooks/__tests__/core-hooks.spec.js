const path = require('path')
const coreHooks = require('../')
const { Starter } = require('@yawf/yawf-core')

describe('core-hooks', () => {

  test('', async () => {
    const starter = new Starter({ rootDir: path.resolve(__dirname, 'mock') })
    starter.bootstrap()
    starter.core.loadHooks(coreHooks)
    await starter.initialize()
    const ormHookMixinClass = starter.core.__mixins.ormHook.utilMixin()
    const ormHookMixinInstance = new ormHookMixinClass()
    expect(ormHookMixinInstance.$models.User).toBeDefined()
  })

})
