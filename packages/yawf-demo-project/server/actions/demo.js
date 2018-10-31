export default class {

  index(req, res) {
    res.json({
      data: [
        'hello',
        'world',
        'from',
        'yawf.'
      ]
    })
  }

  page(req, res) {
    res.render('index')
  }

  topPage(req, res) {
    res.render('top')
  }

}
