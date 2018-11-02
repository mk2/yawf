const util = require('../../lib/util')
const process = require('process')
const path = require('path')

describe('util module test suite', () => {

  test('loadDirFiles normally worked', async () => {
    const moduleMap = await util.readfiles(__dirname, 'mock')
    const test0obj = require('./mock/test0')
    const test1obj = require('./mock/test1')
    expect(moduleMap.test0).toMatchObject(test0obj)
    expect(moduleMap.test1).toMatchObject(test1obj)
  })

})
