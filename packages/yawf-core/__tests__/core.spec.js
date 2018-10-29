const mod = require('../')
const Core = require('../lib/core')
const boot = mod.boot
const process = require('process')
const path = require('path')

describe('core', () => {

  test('read config files', async () => {
    const core = new Core({ router: {}, rootDir: path.resolve(process.cwd(), '__tests__', 'mock') })
    await core.__loadConfigFiles()
    expect(core.__config.routes).toMatchObject(require('./mock/config/routes'))
    expect(core.__config.nestedOptions).toMatchObject(require('./mock/config/nestedOptions'))
    expect(core.__config.camelCaseOptions).toMatchObject(require('./mock/config/camel-case-options'))
    expect(core.__config.viewTemplate).toMatchObject(require('./mock/config/viewTemplate'))
  })

})
