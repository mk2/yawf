import { tasks } from '@yawf/yawf'

export default async function(req, res) {
  await tasks.helloWorld()
  res.render('index')
}
