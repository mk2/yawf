import path from 'path'
import _fs from 'fs'

export const fs = _fs.promises

export function pathr(...pathList) {
  return path.resolve(...pathList)
}

export function tpl(...pathList) {
  return pathr(__dirname, '..', 'templates', ...pathList)
}

export function genTpl(...pathList) {
  return pathr(process.cwd(), ...pathList)
}

export async function writeTpl(srcPath, tgtPath) {
  const srcContent = await fs.readFile(srcPath)
  await fs.writeFile(tgtPath, srcContent)
}
