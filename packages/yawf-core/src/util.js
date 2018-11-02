import path from 'path'
import _fs from 'fs'
import _ from 'lodash'
import glob from 'glob'

// @flow

export const fs = _fs.promises
export const dirname = __dirname

export function basename(pathstr /*: string */) {
  const ext = path.extname(pathstr)
  return path.basename(pathstr, ext)
}

export function dedef(obj) {
  return obj.default ? obj.default : obj
}

export async function readfiles(rootDir /* string */, dirs /* Array<string> | string */, _options = {}) {
  const options = _.merge({
    ext: 'js', 
    useIndex: true 
  }, _options)
  const { ext, useIndex } = options
  dirs = Array.isArray(dirs) ? dirs : [ dirs ]
  const filePathList = glob.sync(path.join(...dirs, '**', `*.${ext}`), { cwd: rootDir })
  let moduleMap = {}

  for (let filePath of filePathList) {
    const module = dedef(await import(path.resolve(rootDir, filePath)))
    const dirnames = path.dirname(filePath)
    const filename = path.basename(filePath, `.${ext}`)
    const isIndex = filename === 'index'

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
    if (useIndex && isIndex && parentDir) {
      parentDir[lastDirname] = module
    } else {
      dir[_.camelCase(filename)] = module
    }
  }

  for (let dir of dirs) {
    moduleMap = moduleMap[dir] ? moduleMap[dir] : moduleMap
  }

  return moduleMap
}

