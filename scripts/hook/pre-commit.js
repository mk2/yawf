/**
 * pre-commit script
 * - check `npm run build` finishing normally.`
 */

const spawn = require('cross-spawn')
const { chunksToLinesAsync } = require('@rauschma/stringio')

async function echoReadable(readable) {
  let contents = ''
  for await (const line of chunksToLinesAsync(readable)) {
    contents += line
  }
  return contents
}

async function main() {
  const child = spawn('npm', [ 'run', 'build' ], { stdio: [ 'ignore', 'ignore', 'pipe' ] })
  const contents = await echoReadable(child.stderr)
  if (contents.indexOf('lerna ERR!') >= 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}
main()
