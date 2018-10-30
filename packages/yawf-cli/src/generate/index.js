import appGenerator from './app'

const command = 'generate [target]'

const aliases = ['gen', 'g']

const describe = 'Generate target'

function builder(yargs) {
  yargs.default('target', 'app')
}

async function handler(argv) {
  if (argv.target === 'app') {
    await appGenerator()
  }
}

export default {
  command,
  aliases,
  describe,
  builder,
  handler
}
