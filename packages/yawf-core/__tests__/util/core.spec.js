const Core = require('../../lib/core')

describe('core test suite', () => {

  let serverApi
  let rootDir
  let options
  let core

  beforeEach(() => {
    serverApi = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      listen: jest.fn()
    }
    rootDir = __dirname
    options = {}
    core = new Core({ serverApi, rootDir, options })
  })

  test('serverApi get called when core get called.', () => {
    core.get({ path: '/', actionFn: () => {}})
    expect(serverApi.get).toHaveBeenCalledTimes(1)
  })

  test('serverApi post called when core post called.', () => {
    core.post({ path: '/', actionFn: () => {}})
    expect(serverApi.post).toHaveBeenCalledTimes(1)
  })

  test('serverApi put called when core put called.', () => {
    core.put({ path: '/', actionFn: () => {}})
    expect(serverApi.put).toHaveBeenCalledTimes(1)
  })

  test('serverApi delete called when core delete called.', () => {
    core.delete({ path: '/', actionFn: () => {}})
    expect(serverApi.delete).toHaveBeenCalledTimes(1)
  })

  test('serverApi listen called when core play called.', () => {
    core.play(3000, () => {})
    expect(serverApi.listen).toHaveBeenCalledTimes(1)
  })

})
