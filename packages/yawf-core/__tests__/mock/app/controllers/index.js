module.exports = class {

  index(req, res) {
    TestHelper.helloWorld()
    res.render('index', { title: 'hello world', message: 'this is pug' })
  }

}
