// @flow

import path from 'path'
import _fs from 'fs'
import _ from 'lodash'
import glob from 'glob'

export const fs = _fs.promises
export const dirname = __dirname

export function basename(pathstr /*: string */) {
  const ext = path.extname(pathstr)
  return path.basename(pathstr, ext)
}

export function dedef(obj /*: any */) {
  return obj.default ? obj.default : obj
}

export async function readfiles(rootDir /*: ?string */, dirs /*: Array<string> | string */, _options /*: any */ = {}) {
  const options = _.merge({
    ext: 'js',
    useIndex: true
  }, _options)
  const { ext, useIndex } = options
  dirs = Array.isArray(dirs) ? dirs : [ dirs ]
  rootDir = rootDir ? rootDir : process.cwd()
  const filePathList = glob.sync(path.join(...dirs, '**', `*.${ext}`), { cwd: rootDir })

  const errors = []
  let moduleMap = {}

  for (let filePath of filePathList) {
    const dirnames = path.normalize(path.dirname(filePath))
    const filename = path.basename(filePath, `.${ext}`)
    const isIndexFile = filename === 'index'

    let parentDir = null
    let dir = moduleMap
    let lastDirname = null

    if (dirname) {
      for (let dirname of dirnames.split(path.sep)) {
        dirname = _.camelCase(dirname)
        if (!dir[dirname]) {
          dir[dirname] = {}
        }
        parentDir = dir
        dir = dir[dirname]
        lastDirname = dirname
      }
    }

    let module = null
    try {
      module = dedef(await import(path.resolve(rootDir, filePath)))
    } catch (e) {
      console.error(e)
      errors.push(e)
    }

    if (useIndex && isIndexFile && parentDir) {
      if (lastDirname) parentDir[lastDirname] = module
    } else {
      dir[_.camelCase(filename)] = module
    }
  }

  for (let dir of dirs) {
    moduleMap = moduleMap[dir] ? moduleMap[dir] : moduleMap
  }

  return moduleMap
}

export function isClass(v /*: any */) {
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

export function mapKeysDeep(obj /*: any */, cb /*: Function */, nestKeys /*: Array<string> */ = []) {
  const wrapCb = (v, k ,o) => (cb(v, k, o, nestKeys), k)
  _.mapValues(
    _.mapKeys(obj, wrapCb),
    (val, key) => {
      return _.isObject(val) ? mapKeysDeep(val, cb, nestKeys.concat(key)) : val
    }
  )
}

export function mergeWithProp(obj /*: any */, ...srcs /*: any */) {
  obj = obj || Object.create(null)
  for (let src of srcs) {
    for (let key of Object.getOwnPropertyNames(src)) {
      const objPropDesc = Object.getOwnPropertyDescriptor(obj, key)
      if (objPropDesc && (objPropDesc.value || objPropDesc.get)) continue
      const srcPropDesc = Object.getOwnPropertyDescriptor(src, key)
      if (srcPropDesc) Object.defineProperty(obj, key, srcPropDesc)
    }
  }
  return obj
}

export function extractHookName(str /*: string */) {
  if (_.startsWith(str, 'yawf-hook-')) {
    return _.camelCase(str.substr(10))
  } else if (_.startsWith(str, 'yawfHook')) {
    return _.camelCase(str.substr(8))
  } else {
    return _.camelCase(str)
  }
}
