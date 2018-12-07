const _fs = require('fs')
const path = require('path')
const fs = _fs.promises

function resolvePath(...relativePath) {
  return path.resolve(process.cwd(), ...relativePath)
}

async function main() {
  await fs.link(resolvePath('scripts', 'pre-commit.sh'), resolvePath('.git', 'hooks', 'pre-commit.sh'))
}
main()
