const yawf = require('../')

describe('exported properties tests', () => {

  test('Hook class exported', () => {
    expect(yawf.Hook).toBeDefined()
  })

  test('start function exported', () => {
    expect(yawf.start).toBeDefined()
  })

})
