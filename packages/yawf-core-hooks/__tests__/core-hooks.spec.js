const path = require('path')
const coreHooks = require('../')
const { Starter } = require('@yawf/yawf-core')

describe('core-hooks', () => {

  test('', async () => {
    const starter = new Starter({ rootDir: path.resolve(__dirname, 'mock') })
    starter.bootstrap()
    starter.core.loadHooks(coreHooks)
    await starter.initialize()
    expect(User).toBeDefined()
  })

})
