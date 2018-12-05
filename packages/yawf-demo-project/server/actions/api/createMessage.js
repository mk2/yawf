import { mixins } from '@yawf/yawf'

export default async function(req, res) {
  const ormMixinClass = mixins.orm.utilMixin()
  const ormMixin = new ormMixinClass()
  const message = ormMixin.$models.Message.build()
  await message.save()
  res.status(200).send('ok')
}
