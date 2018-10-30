const yawf = require('../')

describe('exported properties tests', () => {

  test('Hook class exported', () => {
    expect(yawf.Hook).toBeDefined()
  })

  test('yawf function exported', () => {
    expect(yawf.yawf).toBeDefined()
  })

})
