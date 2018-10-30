const command = 'start'

const aliases = ['s']

const describe = 'Start Yawf'

function builder(yargs) {
}

function handler(argv) {
  console.log('start handler')
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
