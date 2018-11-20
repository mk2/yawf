const util = require('../../lib/util')
const process = require('process')
const path = require('path')

describe('util module test suite', () => {

  test('readmodules normally worked.', async () => {
    const moduleMap = await util.readmodules(__dirname, 'mock')
    const test0obj = require('./mock/test0')
    const test1obj = require('./mock/test1')
    expect(moduleMap.test0).toMatchObject(test0obj)
    expect(moduleMap.test1).toMatchObject(test1obj)
  })

  test('mapKeysDeep normally worked.', async () => {
    util.mapKeysDeep({
      a: {
        b: 'b value',
        c: {
          d: {
            e: 'e value'
          }
        }
      }
    }, (v, k, o, nest) => {
      console.log(nest, v)
    })
  })

  test('extractHookName normally worked.', () => {
    expect(util.extractHookName('yawf-hook-orm')).toBe('orm')
    expect(util.extractHookName('yawf-hook-webpack')).toBe('webpack')
    expect(util.extractHookName('yawf-orm')).toBe('yawfOrm')
  })

})
