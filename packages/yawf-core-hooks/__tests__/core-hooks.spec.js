const coreHooks = require('../')
const { Core } = require('@yawf/yawf-core')

describe('core-hooks', () => {

  test('', () => {
    const core = new Core({ serverApi: {}, rootDir: process.cwd(), options: {} })
    core.loadHooks(coreHooks)
    expect(core.__hooks.objectionJsWrapperHook).toBeDefined()
  })
})
