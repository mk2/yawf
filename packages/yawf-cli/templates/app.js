(async function() {
  require('@babel/register')
  const { yawf } = require('@yawf/yawf')
  const starter = await yawf({
    useCoreHooks: true
  })
  starter.start()
})()
