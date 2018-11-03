const util = require('../../lib/util')
const process = require('process')
const path = require('path')

describe('util module test suite', () => {

  test('readfiles normally worked', async () => {
    const moduleMap = await util.readfiles(__dirname, 'mock')
    const test0obj = require('./mock/test0')
    const test1obj = require('./mock/test1')
    expect(moduleMap.test0).toMatchObject(test0obj)
    expect(moduleMap.test1).toMatchObject(test1obj)
  })

  test('', async () => {
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

})
