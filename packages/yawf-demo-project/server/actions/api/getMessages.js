export default async function(req, res) {
  const messages = await Message.findAll()
  res.status(200).send(messages)
}
