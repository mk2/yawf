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

/**
 * Return given object or a value of the key `default` of it.
 */
export function dedef(obj /*: any */) {
  return obj.default ? obj.default : obj
}

/**
 * Search all files under given rootDir, returns as basename mapped object.
 */
export function globfiles(rootDir /*: string */, _options /*: any */ = {}) /*: { [string]: string } */ {
  const options = _.merge({
    ext: 'js',
    useAbsolutePath: true
  }, _options)
  const { ext, useAbsolutePath } = options
  const files = glob.sync(path.join('**', `*.${ext}`), { cwd: rootDir })
  const filesobj = {}
  for (let file of files) {
    const basename = path.basename(file, `.${ext}`)
    const filename = !!filesobj[filename] ? `${basename}#${process.hrtime.bigint()}` : basename
    filesobj[basename] = useAbsolutePath ? path.resolve(rootDir, file) : path.normalize(file)
  }
  return filesobj
}

/**
 * Read modules under given rootDir, returns as directory mapped object.
 *
 * e.g.:
 *   Here are some files under a directory.
 *   ------------------------
 *   | /hoge
 *   |   - test.js
 *   |   /poge
 *   |     - index.js
 *   ------------------------
 *  We can read these files with readmodules:
 *  ```
 *  const modules = readmodules(__dirname, 'hoge')
 *  assert.deepStrictEqual(modules, {
 *    'test': <<test.js module>>,
 *    poge: <<poge/index.js module>>
 *  })
 *  ```
 */
export async function readmodules(rootDir /*: ?string */, dirs /*: Array<string> | string */, _options /*: any */ = {}) {
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
    const dirnames = path.normalize(path.dirname(filePath)) // path.normalize required for windows (git-bash) environment.
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

/**
 * Walk around given object with given callback function.
 */
export function mapKeysDeep(obj /*: any */, cb /*: Function */, nestKeys /*: Array<string> */ = []) {
  const wrapCb = (v, k ,o) => (cb(v, k, o, nestKeys), k)
  _.mapValues(
    _.mapKeys(obj, wrapCb),
    (val, key) => {
      return _.isObject(val) ? mapKeysDeep(val, cb, nestKeys.concat(key)) : val
    }
  )
}

/**
 * Merge given objects (srcs) to given object via property descriptor and return it.
 */
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

/**
 * Extract hook name to canonical hook name.
 */
export function extractHookName(str /*: string */) {
  if (_.startsWith(str, 'yawf-hook-')) {
    return _.camelCase(str.substr(10))
  } else if (_.startsWith(str, 'yawfHook')) {
    return _.camelCase(str.substr(8))
  } else {
    return _.camelCase(str)
  }
}
