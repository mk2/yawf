import { tasks } from '@yawf/yawf'

export default async function(req, res) {
  tasks.helloWorld()
  res.render('index')
}
