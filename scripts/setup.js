const _fs = require('fs')
const path = require('path')
const fs = _fs.promises

function resolvePath(...relativePath) {
  return path.resolve(process.cwd(), ...relativePath)
}

async function link(src, tgt) {
  try {
    await fs.unlink(tgt)
  } catch (e) {}
  await fs.link(src, tgt)
}

async function main() {
  await link(resolvePath('scripts', 'pre-commit.sh'), resolvePath('.git', 'hooks', 'pre-commit'))
}
main()
