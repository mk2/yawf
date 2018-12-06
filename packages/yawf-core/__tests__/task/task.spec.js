const path = require('path')
const Core = require('../../lib/core')

describe('Task specs', () => {

  test('Run task normally.', async () => {
    const core = new Core({ serverApi: {}, rootDir: __dirname, options: {} })
    core.__loadTask('test', path.resolve(__dirname, './task'))
    const output = await core.__tasks['test']({ name: 'mk2' })
    expect(output).toBe('I am mk2.')
  })

})
