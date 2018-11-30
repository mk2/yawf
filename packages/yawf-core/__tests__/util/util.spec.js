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
      // console.log(nest, v)
      if (nest.length === 0) {
        expect(v).toEqual({ b: 'b value', c: { d: { e: 'e value' } } })
      }
    })
  })

  test('dedef normally worked.', () => {
    expect(util.dedef({ hello: 'world' })).toEqual({ hello: 'world' })
    expect(util.dedef({ default: { hello: 'world' } })).toEqual({ hello: 'world' })
  })

  test('isClass normally worked.', () => {
    expect(util.isClass(class {})).toBeTruthy()
    expect(util.isClass(function() {})).toBeFalsy()
  })

  test('extractHookName normally worked.', () => {
    expect(util.extractHookName('yawf-hook-orm')).toBe('orm')
    expect(util.extractHookName('yawf-hook-webpack')).toBe('webpack')
    expect(util.extractHookName('yawf-orm')).toBe('yawfOrm')
  })

})
