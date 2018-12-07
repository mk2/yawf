const spawn = require('cross-spawn')

const result = spawn.sync('npm', [ 'run', 'build' ], { stdio: 'inherit' })

if (!result.error) {
  process.exit(0)
} else {
  process.exit(1)
}
