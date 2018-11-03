export default async function(req, res) {
  const message = Message.build()
  await message.save()
  res.status(200).send('ok')
}
