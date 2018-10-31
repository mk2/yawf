import path from 'path'
import _fs from 'fs'
import _ from 'lodash'

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

export async function loadDirFiles(rootDir /*: ?string */, ...dir /*: Array<string> */) {
  if (!rootDir) return

  const objMap = {}
  const files = await fs.readdir(path.resolve(rootDir, ...dir))

  for (let file of files) {
    const obj = await import(path.resolve(rootDir, ...dir, file))
    objMap[_.camelCase(basename(file))] = obj.default ? obj.default : obj
  }

  return objMap
}

export async function loadFiles(rootDir /*: ?string */, ...filePathList /*: Array<string> */) {
  if (!rootDir || !filePathList || filePathList.length < 1) return

  const objMap = {}
  for (let filePath of filePathList) {
    const obj = dedef(await import(path.resolve(rootDir, filePath)))
    const dirname = path.dirname(filePath)
    const filename = path.basename(filePath, '.js')
    const isIndex = filename === 'index'

    let parentTgt = null
    let tgt = objMap
    let lastKey = null
    if (dirname) {
      for (let key of dirname.split(path.sep)) {
        key = _.camelCase(key) 
        if (!tgt[key]) {
          tgt[key] = {}
        }
        parentTgt = tgt
        tgt = tgt[key]
        lastKey = key
      }
    }
    if (parentTgt && isIndex) {
      parentTgt[lastKey] = obj
    } else {
      tgt[_.camelCase(filename)] = obj
    }
  }
  return objMap
}
