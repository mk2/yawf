export default class {

  async createMessage(req, res) {
    const message = Message.build()
    await message.save()
    res.status(200).send('ok')
  }

  async getMessages(req, res) {
    const messages = await Message.findAll()
    res.status(200).send(messages)
  }

}
