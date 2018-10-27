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

export async function loadFiles(rootDir /*: ?string */, ...dir /*: Array<string> */) {
  if (!rootDir) return

  const objMap = {}
  const files = await fs.readdir(path.resolve(rootDir, ...dir))

  for (let file of files) {
    const obj = await import(path.resolve(rootDir, ...dir, file))
    objMap[_.camelCase(basename(file))] = obj.default ? obj.default : obj
  }

  return objMap
}
