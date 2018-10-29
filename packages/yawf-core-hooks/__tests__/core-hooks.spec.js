const path = require('path')
const coreHooks = require('../')
const { Starter } = require('@yawf/yawf-core')

describe('core-hooks', () => {

  test('', async () => {
    const starter = new Starter({ rootDir: path.resolve(process.cwd(), '__tests__', 'mock') })
    starter.bootstrap()
    $loadHooks(coreHooks)
    await starter.initialize()
    expect(User).toBeDefined()
    expect($knex).toBeDefined()
  })

})
